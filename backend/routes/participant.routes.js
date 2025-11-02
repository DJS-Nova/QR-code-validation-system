import express from "express";
import { verifyToken, isSuperAdmin } from "../middleware/auth.js";
import { getAllParticipants } from "../controllers/participant.controller.js";

const router = express.Router();

router.get("/", verifyToken, isSuperAdmin, getAllParticipants);

export default router;

