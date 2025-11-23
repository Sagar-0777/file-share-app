import express from "express";
import { getFileByShareId } from "../controller/downloadController.js";

const router = express.Router();

// Public route - no authentication required
router.get("/:shareId", getFileByShareId);

export default router;
