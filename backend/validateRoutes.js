const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const validateCollegeId =
  require("./validators/collegeIdValidator");
const router = express.Router();

// Allowed extensions
const allowedExtensions = [".jpg", ".jpeg", ".png", ".pdf"];

// Allowed MIME types
const allowedMimeTypes = [
  "image/jpeg",
  "image/png",
  "application/pdf",
];

// Ensure uploads folder exists
const uploadDir = "uploads/";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueName =
      Date.now() + "-" + Math.round(Math.random() * 1e9) +
      path.extname(file.originalname);

    cb(null, uniqueName);
  },
});

// File filter (extension + MIME check)
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();

  if (!allowedExtensions.includes(ext)) {
    return cb(
      new Error("Only JPG, JPEG, PNG and PDF files are allowed"),
      false
    );
  }

  if (!allowedMimeTypes.includes(file.mimetype)) {
    return cb(new Error("Invalid MIME type"), false);
  }

  cb(null, true);
};

// Multer setup
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

// Helper to safely delete file
const safeDelete = (filePath) => {
  try {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (err) {
    console.log("File delete error:", err.message);
  }
};

// Route
router.post(
  "/validate-document",
  upload.single("document"),
  async (req, res) => {
    let filePath = null;

    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No file uploaded",
        });
      }

      filePath = req.file.path;

      // Business logic validation
      const result =
  await validateCollegeId(
    filePath,
    req.file.originalname
  );
safeDelete(filePath);

return res.json(result);
    } catch (error) {
      console.error("Validation error:", error);

      safeDelete(filePath);

      return res.status(500).json({
        success: false,
        message: error.message || "Validation failed",
      });
    }
  }
);

module.exports = router;