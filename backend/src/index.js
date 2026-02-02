import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";

// Import routes
import authRoutes from "./routes/auth.js";
import uploadRoutes from "./routes/uploads.js";
import downloadRoutes from "./routes/download.js";

// Import middleware
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
const app = express();

// CORS Configuration
const allowedOrigins = process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(",") : ["http://localhost:5173"];
const corsOptions = {
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes("*")) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
    optionsSuccessStatus: 200,
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Database Connection
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log("✅ Connected to MongoDB");
    })
    .catch((err) => {
        console.error("❌ MongoDB connection error:", err);
        process.exit(1);
    });

// Health check route
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "File Share App API",
        version: "1.0.0",
        status: "running",
    });
});

app.get("/health", (req, res) => {
    res.json({
        success: true,
        status: "healthy",
        timestamp: new Date().toISOString(),
    });
});


// Other API Routes
app.use("/api/auth", authRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/download", downloadRoutes);

// 404 Handler (must be after all routes)
app.use(notFoundHandler);

// Global Error Handler (must be last)
app.use(errorHandler);

// Start Server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`📝 Environment: ${process.env.NODE_ENV || "development"}`);
});
