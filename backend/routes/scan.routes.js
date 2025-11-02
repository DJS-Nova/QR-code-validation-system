import express from "express";
import { verifyToken } from "../middleware/auth.js";
import { scanQR } from "../controllers/scan.controller.js";

const router = express.Router();

router.post("/", verifyToken, scanQR);

export default router;

