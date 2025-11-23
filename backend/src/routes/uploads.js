import express from "express";
import multer from "multer";
import {
    uploadFile,
    getUserFiles,
    deleteFile,
} from "../controller/uploadController.js";
import { verifyToken } from "../middleware/jwtAuth.js";
import { uploadLimiter } from "../middleware/rateLimit.js";

const router = express.Router();

// Configure multer for file upload (store in memory)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 100 * 1024 * 1024, // 100MB max file size
    },
});

// All routes require authentication
router.post("/", verifyToken, uploadLimiter, upload.single("file"), uploadFile);
router.get("/", verifyToken, getUserFiles);
router.delete("/:fileId", verifyToken, deleteFile);

export default router;
