import express from "express";
import { login } from "../controllers/auth.controller.js";
import { wrapAsync } from "../utils/expressError.js";

const router = express.Router();

router.post("/login", wrapAsync(login));

export default router;

