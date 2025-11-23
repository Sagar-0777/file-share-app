/**
 * Global error handler middleware
 * This catches any unhandled errors in the application
 */
export const errorHandler = (err, req, res, next) => {
    console.error("Error:", err);

    // Handle specific error types
    if (err.name === "ValidationError") {
        return res.status(400).json({
            success: false,
            message: "Validation error",
            errors: Object.values(err.errors).map((e) => e.message),
        });
    }

    if (err.name === "CastError") {
        return res.status(400).json({
            success: false,
            message: "Invalid ID format",
        });
    }

    if (err.code === 11000) {
        return res.status(409).json({
            success: false,
            message: "Duplicate entry - resource already exists",
        });
    }

    // Default error response
    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || "Internal server error",
    });
};

/**
 * 404 Not Found handler
 */
export const notFoundHandler = (req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found",
    });
};
