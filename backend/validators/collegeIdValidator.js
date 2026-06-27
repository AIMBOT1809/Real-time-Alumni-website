const { PDFParse } = require("pdf-parse");
const Tesseract = require("tesseract.js");
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const validateCollegeId = async (filePath, originalName) => {
  let extractedText = "";
  const ext = path.extname(originalName).toLowerCase();

  console.log("Extension:", ext);

  if (ext === ".pdf") {
    const pdfBuffer = fs.readFileSync(filePath);
    const parser = new PDFParse({ data: pdfBuffer });
    const pdfData = await parser.getText();

    extractedText = pdfData.text.toLowerCase();
  } 
  else if ([".jpg", ".jpeg", ".png"].includes(ext)) {
    const processedPath = `${filePath}-processed.png`;

    await sharp(filePath)
      .resize({ width: 1600 })
      .grayscale()
      .normalize()
      .sharpen()
      .png()
      .toFile(processedPath);

    const result = await Tesseract.recognize(processedPath, "eng");

    extractedText = result.data.text.toLowerCase();

    if (fs.existsSync(processedPath)) {
      fs.unlinkSync(processedPath);
    }
  } 
  else {
    return {
      success: false,
      message: "Only PDF files are allowed.",
      matchedKeywords: [],
      extractedText: ""
    };
  }

  const normalizedText = extractedText
    .replace(/\s+/g, "")
    .replace(/[^a-z0-9]/g, "");

  // TKR must be mandatory
  const hasTKR =
    normalizedText.includes("tkr") ||
    normalizedText.includes("tkrcet") ||
    normalizedText.includes("tkrcollege") ||
    normalizedText.includes("tkrcollegeofengineeringtechnology") ||
    normalizedText.includes("tkrcollegeofengineeringandtechnology");

  const idCardKeywords = [
    "engineeringtechnology",
    "engineeringandtechnology",
    "rollno",
    "rollnumber",
    "branch",
    "dob",
    "dateofbirth",
    "validity",
    "valid",
    "principal"
  ];

  const matchedKeywords = idCardKeywords.filter((keyword) =>
    normalizedText.includes(keyword)
  );

  console.log("Extracted Text:", extractedText);
  console.log("Normalized Text:", normalizedText);
  console.log("TKR Found:", hasTKR);
  console.log("Matched ID Keywords:", matchedKeywords);

  const isValidTKRIdCard = hasTKR && matchedKeywords.length >= 3;

  if (isValidTKRIdCard) {
    return {
      success: true,
      matchedKeywords,
      extractedText
    };
  }

  return {
    success: false,
    message: "Invalid document. Please upload a valid TKR College ID card.",
    matchedKeywords,
    extractedText
  };
};

module.exports = validateCollegeId;