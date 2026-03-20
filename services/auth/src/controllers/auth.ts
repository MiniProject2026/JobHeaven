import axios from "axios";
import getbuffer from "../utils/buffer.js";
import { sql } from "../utils/db.js";
import ErrorHandler from "../utils/errorHandler.js";
import { tryCatch } from "../utils/TryCatch.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { forgotPasswordTemplate } from "../templete.js";
import { publishToTopic } from "../producer.js";
import { redisClient } from "../index.js";

export const registerUser = tryCatch(async (req, res, next) => {
  const { name, email, password, phoneNumber, role, bio } = req.body;

  if (!name || !email || !password || !phoneNumber || !role) {
    throw new ErrorHandler(400, "All fields are required");
  }

  const existingUser =
    await sql`SELECT user_id FROM users WHERE email = ${email}`;

  if (existingUser.length > 0) {
    throw new ErrorHandler(400, "User already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  let registeredUser;

  if (role === "recruiter") {
    const [user] = await sql`
      INSERT INTO users (name, email, password, phone_number, role, bio)
      VALUES (${name}, ${email}, ${hashedPassword}, ${phoneNumber}, ${role}, ${bio})
      RETURNING user_id, name, email, phone_number, role, created_at
    `;

    registeredUser = user;
  } else if (role === "jobseeker") {
    const file = req.file;

    console.log("FILE:", file); // debug

    if (!file) {
      throw new ErrorHandler(400, "Resume file is required for job seekers");
    }

    const filebuffer = getbuffer(file);

    if (!filebuffer || !filebuffer.content) {
      throw new ErrorHandler(500, "Failed to generate buffer");
    }

    const { data } = await axios.post(
      `${process.env.UPLOAD_SERVICES}/api/utils/upload`,
      { buffer: filebuffer.content },
    );

    const [user] = await sql`
      INSERT INTO users (name, email, password, phone_number, role, bio, resume, resume_public_id)
      VALUES (${name}, ${email}, ${hashedPassword}, ${phoneNumber}, ${role}, ${bio}, ${data.url}, ${data.public_id})
      RETURNING user_id, name, email, phone_number, role, bio, resume, created_at
    `;

    registeredUser = user;
  }

  const token = jwt.sign(
    { id: registeredUser?.user_id },
    process.env.JWT_SEC!,
    { expiresIn: "15d" },
  );

  res.json({
    message: "User registered successfully",
    user: registeredUser,
    token,
  });
});

export const loginUser = tryCatch(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ErrorHandler(400, "Email and password are required");
  }

  const user = await sql`
    SELECT 
      u.user_id,
      u.name,
      u.email,
      u.password,
      u.phone_number,
      u.role,
      u.bio,
      u.resume,
      u.subscription,
      ARRAY_AGG(s.name) FILTER (WHERE s.name IS NOT NULL) AS skills
    FROM users u
    LEFT JOIN user_skills us ON u.user_id = us.user_id
    LEFT JOIN skills s ON us.skill_id = s.skill_id
    WHERE u.email = ${email}
    GROUP BY 
      u.user_id,
      u.name,
      u.email,
      u.password,
      u.phone_number,
      u.role,
      u.bio,
      u.resume,
      u.subscription
  `;

  if (user.length === 0) {
    throw new ErrorHandler(400, "Invalid email or password");
  }

  const userObject = user[0];

  const matchPassword = await bcrypt.compare(password, userObject.password);

  if (!matchPassword) {
    throw new ErrorHandler(400, "Invalid email or password");
  }

  userObject.skills = userObject.skills || [];

  delete userObject.password;

  const token = jwt.sign({ id: userObject.user_id }, process.env.JWT_SEC!, {
    expiresIn: "15d",
  });

  res.json({
    message: "User logged in successfully",
    user: userObject,
    token,
  });
});

export const forgotPassword = tryCatch(async (req, res, next) => {
  const { email } = req.body;
  if (!email) {
    throw new ErrorHandler(400, "Email is required");
  }

  const users =
    await sql`SELECT user_id, name FROM users WHERE email = ${email}`;
  if (users.length === 0) {
    return res.json({
      message: "If a user with that email exists, a reset link has been sent",
    });
  }

  const user = users[0];

  const resetToken = jwt.sign(
    { 
    email: user.email,
    type: "reset",
   },
   process.env.JWT_SEC as string,
   {expiresIn: "15m"} 
  );

   const resetLink = `${process.env.FRONTEND_URL}/reset/${resetToken}`;

   await redisClient.set(`forgot:${email}`, resetToken, 
    {
      EX: 900,
    })

   const message = {
    to: email,
    subject: "Password Reset Request",
    html:forgotPasswordTemplate(resetLink),
   };

   publishToTopic("send-mail", message).catch((error) => {
    console.error("Failed to publish password reset email to Kafka:", error);
  });

  res.json({
    message: "If a user with that email exists, a reset link has been sent",
  });

});
