const path = require("path");

const validateAlumniMemo = async (filePath, originalName) => {
  const ext = path.extname(originalName).toLowerCase();

  console.log("File received:", originalName);
  console.log("Extension:", ext);

  // Accept every uploaded file without any validation
  return {
    success: true,
    documentType: "Uploaded Document",
    message: "Document uploaded successfully.",
    matchedKeywords: [],
    extractedText: ""
  };
};

module.exports = validateAlumniMemo;