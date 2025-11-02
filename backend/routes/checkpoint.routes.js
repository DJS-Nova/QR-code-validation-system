import express from "express";
import { verifyToken, isSuperAdmin } from "../middleware/auth.js";
import {
  createCheckpoint,
  getAllCheckpoints,
  updateCheckpoint,
  deleteCheckpoint,
} from "../controllers/checkpoint.controller.js";

const router = express.Router();

router.post("/", verifyToken, isSuperAdmin, createCheckpoint);
router.get("/", verifyToken, getAllCheckpoints);
router.put("/:id", verifyToken, isSuperAdmin, updateCheckpoint);
router.delete("/:id", verifyToken, isSuperAdmin, deleteCheckpoint);

export default router;

