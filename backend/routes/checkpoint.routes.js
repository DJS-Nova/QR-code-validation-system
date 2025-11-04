import express from "express";
import { verifyToken, isSuperAdmin } from "../middleware/auth.js";
import {
  createCheckpoint,
  getAllCheckpoints,
  updateCheckpoint,
  deleteCheckpoint,
} from "../controllers/checkpoint.controller.js";
import { wrapAsync } from "../utils/expressError.js";
import { validateExit } from "../controllers/validate-exit.controller.js";

const router = express.Router();

router.post("/", verifyToken, isSuperAdmin, wrapAsync(createCheckpoint));
router.get("/", verifyToken, wrapAsync(getAllCheckpoints));
router.patch("/validate-exit/:id", verifyToken, isSuperAdmin, wrapAsync(validateExit));
router.put("/:id", verifyToken, isSuperAdmin, wrapAsync(updateCheckpoint));
router.delete("/:id", verifyToken, isSuperAdmin, wrapAsync(deleteCheckpoint));


export default router;

