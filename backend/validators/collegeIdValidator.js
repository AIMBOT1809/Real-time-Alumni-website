const pdf = require("pdf-parse");
const pdfParse =
  pdf.default || pdf;
const Tesseract = require("tesseract.js");
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const validateCollegeId = async (
  filePath,
  originalName
) => {
  let extractedText = "";
const ext = path.extname(originalName).toLowerCase();
console.log("Extension:", ext);
    // PDF VALIDATION
if (ext === ".pdf") {

  const pdfBuffer =
    fs.readFileSync(filePath);

  const pdfData =
    await pdfParse(pdfBuffer);

  extractedText =
    pdfData.text.toLowerCase();
}
  // IMAGE
  else if (
    ext === ".jpg" ||
    ext === ".jpeg" ||
    ext === ".png"
  ) {

    const processedPath =
      `${filePath}-processed.png`;

    await sharp(filePath)

      .resize({ width: 1200 })

      .grayscale()

      .png()

      .toFile(processedPath);

    const result =
      await Tesseract.recognize(
        processedPath,
        "eng"
      );

    extractedText =
      result.data.text.toLowerCase();

    fs.unlinkSync(processedPath);
  }

  const normalizedText =
    extractedText
      .replace(/\s+/g, "")
      .replace(/[^a-z0-9]/g, "");

  const keywords = [
    "tkr",
    "college",
    "university",
    "engineering",
    "student",
    "faculty",
    "id card",
    "idcard",
    "company",
    "employee",
    "name",
    "employee name",
    "emp id",
    "staff id",
    "designation",
    "department",
    "rollno",
    "validity",
    "private limited",
    "pvt ltd",
    "corporation",
    "technologies",
    "valid till",
    "authorized",
    "access card",
    "human resources",
    "barcode",
    "qr code",
    "office address",
    "employee code",
    "phone"
  ];

  const matchedKeywords = [];

  keywords.forEach(keyword => {

    const normalizedKeyword =
      keyword.replace(/\s+/g, "");

    if (
      normalizedText.includes(
        normalizedKeyword
      )
    ) {

      matchedKeywords.push(keyword);
    }
  });

  console.log(
  "Matched Keywords:",
  matchedKeywords
);

// ACCEPT ONLY IF 2 OR MORE KEYWORDS MATCH
if (matchedKeywords.length >= 2) {

  return {

    success: true,

    matchedKeywords,

    extractedText
  };
}

return {

  success: false,

  matchedKeywords: [],

  extractedText
};
};

module.exports = validateCollegeId;