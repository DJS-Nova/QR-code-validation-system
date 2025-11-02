import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

// ✅ Check if token is valid
export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log("Auth header:", authHeader);

  if (!authHeader) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];
  console.log("Extracted token:", token);

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log("Decoded JWT:", decoded); // ✅ Add this line
    req.user = decoded;
    next();
  } catch (err) {
    console.error("JWT verification failed:", err.message);
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};

// ✅ Check if user is a Super Admin
export const isSuperAdmin = (req, res, next) => {
  if (req.user.role !== "superadmin") {
    return res.status(403).json({ message: "Access denied: Super Admins only" });
  }
  next();
};
