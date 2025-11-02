import express from "express";
import { verifyToken, isSuperAdmin } from "../middleware/auth.js";
import { getDashboardStats } from "../controllers/dashboard.controller.js";

const router = express.Router();

router.get("/dashboard-stats", verifyToken, isSuperAdmin, getDashboardStats);

export default router;

