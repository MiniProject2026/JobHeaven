import axios from "axios";
import { AuthenticatedRequest } from "../middleware/auth.js";
import getbuffer from "../utils/buffer.js";
import { sql } from "../utils/db.js";
import ErrorHandler from "../utils/errorHandler.js";
import { tryCatch } from "../utils/TryCatch.js";
export const createCompany = tryCatch(
  async (req: AuthenticatedRequest, res) => {
    const user = req.user;
    if (!user) {
      throw new ErrorHandler(401, "Authentication required");
    }
    if (user.role !== "recruiter") {
      throw new ErrorHandler(
        403,
        "Forbidden, Only recruiter can create a comapany",
      );
    }
    const { name, description, website } = req.body;
    if (!name || !description || !website) {
      throw new ErrorHandler(400, "All the fields required");
    }
    const existingCompanies =
      await sql`SELECT company_id FROM companies WHERE name=${name}`;
    if (existingCompanies.length > 0) {
      throw new ErrorHandler(409, `A company with this name already exists`);
    }
    const file = req.file;
    if (!file) throw new ErrorHandler(400, "Company logo file is required");
    const fileBuffer = getbuffer(file);
    if (!fileBuffer || !fileBuffer.content)
      throw new ErrorHandler(500, "Failed to create file buffer");
    const { data } = await axios.post(
      `${process.env.UPLOAD_SERVICE}/api/utils/upload`,
      { buffer: fileBuffer.content },
    );
    const [newCompany] =
      await sql`INSERT INTO companies (name,description,website,logo,logo_public_id,recruiter_id) VALUES (${name}, ${description}, ${website}, ${data.url}, ${data.public_id}, ${req.user?.user_id}) RETURNING *`;
    res.json({
      message: "Company created successfully",
      company: newCompany,
    });
  },
);

export const deleteCompany = tryCatch(
  async (req: AuthenticatedRequest, res) => {
    const user = req.user;
    const { companyId } = req.params;
    const [company] =
      await sql`SELECT logo_public_id FROM companies WHERE company_id=${companyId} AND recruiter_id=${user?.user_id}`;
    if (!company) {
      throw new ErrorHandler(
        404,
        "Company not found or you're not authorised to delete it",
      );
    }
    await sql`DELETE FROM companies WHERE company_id=${companyId}`;
    res.json({
      message: "Company and all associated jobs have been deleted",
    });
  },
);
