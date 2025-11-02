import express from "express";
import { verifyToken } from "../middleware/auth.js";
import { getParticipantStatus, getLiveStatus } from "../controllers/status.controller.js";

const router = express.Router();

router.get("/participant-status/:token/:checkpointId", verifyToken, getParticipantStatus);
router.get("/live-status", verifyToken, getLiveStatus);

export default router;

