import axios from "axios";
import getbuffer from "../utils/buffer.js";
import { sql } from "../utils/db.js";

import ErrorHandler from "../utils/errorHandler.js";
import { tryCatch } from "../utils/TryCatch.js";
import bcrypt from "bcrypt";

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

  let resgisteredUser;
  if (role === "recruiter") {
    const [user] =
      await sql`INSERT INTO users (name, email, password, phone_number,role,bio) VALUES (${name}, ${email}, ${hashedPassword}, ${phoneNumber}, ${role}, ${bio}) RETURNING user_id, name, email, phone_number, role, crated_at`;

    resgisteredUser = user;
  } else if (role === "jobseeker") {
    const file = req.file;

if(!file){
    throw new ErrorHandler(400, "Profile picture is required");
}

const filebuffer= getbuffer(file);


if(!filebuffer || filebuffer.content){
    throw new ErrorHandler(500,"failed to generate buffer ");
}

    const {data}= await axios.post(`${process.env.UTILS_URL}/api/utils/upload`,
      {buffer: filebuffer.content}
    );

    const [user] =
      await sql`INSERT INTO users (name, email, password, phone_number, role,bio,resume,    resume_public_id) VALUES (${name}, ${email}, ${hashedPassword}, ${phoneNumber}, ${role}, ${bio}, ${data.url}, ${data.public_id}) RETURNING user_id, name, email, phone_number, role,bio,resume, created_at`;
  }
  res.json(name);
});
