const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const validateCollegeId = require("./validators/collegeIdValidator");
const validateAlumniMemo = require("./validators/memoValidator");

const router = express.Router();

const allowedExtensions = [".jpg", ".jpeg", ".png", ".pdf"];

const allowedMimeTypes = [
  "image/jpeg",
  "image/png",
  "application/pdf",
];

const uploadDir = path.join(__dirname, 'uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },

  filename: function (req, file, cb) {
    const uniqueName =
      Date.now() +
      "-" +
      Math.round(Math.random() * 1e9) +
      path.extname(file.originalname);

    cb(null, uniqueName);
  },
});

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

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

const safeDelete = (filePath) => {
  try {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (err) {
    console.log("File delete error:", err.message);
  }
};

router.post("/verify-id", (req, res) => {
  upload.single("idCard")(req, res, async (err) => {
    let filePath = null;

    try {
      if (err) {
        return res.status(400).json({
          valid: false,
          reason: err.message,
        });
      }

      if (!req.file) {
        return res.status(400).json({
          valid: false,
          reason: "No file uploaded",
        });
      }

      const role = req.body.role;

      if (!role) {
        safeDelete(req.file.path);

        return res.status(400).json({
          valid: false,
          reason: "Role is required",
        });
      }

      filePath = req.file.path;

      console.log("Uploading file:", {
        role,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        path: req.file.path,
      });

      let result;

      if (role === "student") {
        result = await validateCollegeId(
          filePath,
          req.file.originalname
        );
      } else if (role === "alumni") {
        result = await validateAlumniMemo(
          filePath,
          req.file.originalname
        );
      } else if (role === "faculty") {
        safeDelete(filePath);

        return res.json({
          valid: true,
          message: "Faculty document validation skipped.",
        });
      } else {
        safeDelete(filePath);

        return res.status(400).json({
          valid: false,
          reason: "Invalid role",
        });
      }

      console.log("OCR extracted text:", result.extractedText);
      console.log("Matched keywords:", result.matchedKeywords);
      console.log("Validation result:", result.success);

      safeDelete(filePath);

      if (result.success) {
        return res.json({
          valid: true,
          documentType: result.documentType || "TKR College ID",
          message: result.message || "Document verified successfully.",
        });
      }

      return res.status(400).json({
        valid: false,
        reason: result.message || "Invalid document.",
        matchedKeywords: result.matchedKeywords || [],
      });
    } catch (error) {
      console.error("Validation error:", error);

      safeDelete(filePath);

      return res.status(500).json({
        valid: false,
        reason: error.message || "Validation failed",
      });
    }
  });
});

module.exports = router;