import express from "express";
import { verifyToken, isSuperAdmin } from "../middleware/auth.js";
import { getAllParticipants } from "../controllers/participant.controller.js";
import { wrapAsync } from "../utils/expressError.js";

const router = express.Router();

router.get("/", verifyToken, isSuperAdmin, wrapAsync(getAllParticipants));

export default router;

