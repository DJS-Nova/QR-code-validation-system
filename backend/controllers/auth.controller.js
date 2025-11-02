import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../prismaClient.js";
import dotenv from "dotenv";
import { ExpressError } from "../utils/expressError.js";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

export const login = async (req, res) => {
  const { email, password } = req.body;
  
  const admin = await prisma.admin.findUnique({ where: { email } });
  if (!admin) {
    throw new ExpressError("Admin not found", 404);
  }
  
  const isMatch = await bcrypt.compare(password, admin.password);
  if (!isMatch) {
    throw new ExpressError("Invalid password", 401);
  }
  
  const token = jwt.sign(
    { id: admin.id, email: admin.email, role: admin.role },
    JWT_SECRET,
    { expiresIn: "1d" }
  );
  
  res.json({ token, role: admin.role });
};

