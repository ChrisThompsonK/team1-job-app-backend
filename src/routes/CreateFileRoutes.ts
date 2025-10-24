import fs from "node:fs";
import path from "node:path";
import { Router } from "express";
import { requireAuth } from "../middleware/authMiddleware.js";
import { asyncHandler } from "../middleware/errorHandler.js";

/**
 * Create file serving routes
 * Handles secure file downloads for CVs and other uploaded documents
 */
export const createFileRoutes = () => {
  const router = Router();

  /**
   * GET /files/cv/:filename - Download CV files
   * Requires authentication (users can download their own CVs, admins can download any)
   * Security: Validates file exists and prevents directory traversal
   */
  router.get(
    "/files/cv/:filename",
    requireAuth,
    asyncHandler(async (req, res): Promise<void> => {
      const { filename } = req.params;

      // Validate filename to prevent directory traversal attacks
      if (
        !filename ||
        filename.includes("..") ||
        filename.includes("/") ||
        filename.includes("\\")
      ) {
        res.status(400).json({
          success: false,
          message: "Invalid filename",
        });
        return;
      }

      // Construct safe file path
      const uploadsDir = path.join(process.cwd(), "uploads", "cvs");
      const filePath = path.join(uploadsDir, filename);

      // Check if file exists
      if (!fs.existsSync(filePath)) {
        res.status(404).json({
          success: false,
          message: "File not found",
        });
        return;
      }

      // Additional security: ensure the resolved path is within uploads directory
      const resolvedPath = path.resolve(filePath);
      const resolvedUploadsDir = path.resolve(uploadsDir);

      if (!resolvedPath.startsWith(resolvedUploadsDir)) {
        res.status(403).json({
          success: false,
          message: "Access denied",
        });
        return;
      }

      try {
        // Get file stats
        const stats = fs.statSync(filePath);

        // Set appropriate headers for file download
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Length", stats.size);
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="${filename}"`
        );
        res.setHeader("Cache-Control", "private, no-cache");

        // Create read stream and pipe to response
        const fileStream = fs.createReadStream(filePath);

        fileStream.on("error", (error) => {
          console.error("Error reading file:", error);
          if (!res.headersSent) {
            res.status(500).json({
              success: false,
              message: "Error reading file",
            });
          }
        });

        fileStream.pipe(res);
      } catch (error) {
        console.error("Error serving file:", error);
        res.status(500).json({
          success: false,
          message: "Error serving file",
        });
      }
    })
  );

  /**
   * GET /files/cv/:filename/info - Get CV file information without downloading
   * Requires authentication
   * Returns file metadata like size, upload date, etc.
   */
  router.get(
    "/files/cv/:filename/info",
    requireAuth,
    asyncHandler(async (req, res): Promise<void> => {
      const { filename } = req.params;

      // Validate filename
      if (
        !filename ||
        filename.includes("..") ||
        filename.includes("/") ||
        filename.includes("\\")
      ) {
        res.status(400).json({
          success: false,
          message: "Invalid filename",
        });
        return;
      }

      const uploadsDir = path.join(process.cwd(), "uploads", "cvs");
      const filePath = path.join(uploadsDir, filename);

      if (!fs.existsSync(filePath)) {
        res.status(404).json({
          success: false,
          message: "File not found",
        });
        return;
      }

      try {
        const stats = fs.statSync(filePath);

        res.json({
          success: true,
          data: {
            filename,
            size: stats.size,
            sizeFormatted: formatBytes(stats.size),
            uploadDate: stats.birthtime,
            lastModified: stats.mtime,
            type: "application/pdf",
          },
        });
      } catch (error) {
        console.error("Error getting file info:", error);
        res.status(500).json({
          success: false,
          message: "Error getting file information",
        });
      }
    })
  );

  return router;
};

/**
 * Helper function to format bytes into human readable format
 */
function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${Number.parseFloat((bytes / k ** i).toFixed(dm))} ${sizes[i]}`;
}
