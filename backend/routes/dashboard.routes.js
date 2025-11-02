import express from "express";
import { verifyToken, isSuperAdmin } from "../middleware/auth.js";
import { getDashboardStats } from "../controllers/dashboard.controller.js";
import { wrapAsync } from "../utils/expressError.js";

const router = express.Router();

router.get("/dashboard-stats", verifyToken, isSuperAdmin, wrapAsync(getDashboardStats));

export default router;

