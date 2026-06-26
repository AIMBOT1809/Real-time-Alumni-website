const { PDFParse } = require("pdf-parse");
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
  const parser = new PDFParse({ data: pdfBuffer });

const pdfData = await parser.getText();

extractedText = pdfData.text.toLowerCase();
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

  const requiredKeywords = [
  "tkrcollegeofengineeringandtechnology",
  "memorandumofgrade",
  "hallticketno",
  "branchspecialization",
  "semesterregularexaminations",
  "sgpa",
  "cgpa",
  "controllerofexaminations"
];

const subjectKeywords = [
  "subjectcode",
  "subjecttitle",
  "grade",
  "credits",
  "passed",
  "appeared"
];

const matchedRequired = [];
const matchedSubject = [];

requiredKeywords.forEach(keyword => {
  if (normalizedText.includes(keyword)) {
    matchedRequired.push(keyword);
  }
});

subjectKeywords.forEach(keyword => {
  if (normalizedText.includes(keyword)) {
    matchedSubject.push(keyword);
  }
});

console.log("Matched Required:", matchedRequired);
console.log("Matched Subject:", matchedSubject);

// Accept only TKR marks memo type document
const isTKRCollege =
  normalizedText.includes("tkrcollegeofengineeringandtechnology") ||
  normalizedText.includes("tkrcollege") ||
  normalizedText.includes("tkrcet");

const isMemo =
  matchedRequired.length >= 4 &&
  matchedSubject.length >= 3;

if (isTKRCollege && isMemo) {
  return {
    success: true,
    matchedKeywords: [...matchedRequired, ...matchedSubject],
    extractedText
  };
}

return {
  success: false,
  matchedKeywords: [...matchedRequired, ...matchedSubject],
  extractedText
};
};

module.exports = validateCollegeId;