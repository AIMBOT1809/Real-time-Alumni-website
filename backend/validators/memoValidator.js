const { PDFParse } = require("pdf-parse");
const Tesseract = require("tesseract.js");
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const validateAlumniMemo = async (filePath, originalName) => {
  let extractedText = "";
  const ext = path.extname(originalName).toLowerCase();

  console.log("Extension:", ext);

  if (ext === ".pdf") {
    const pdfBuffer = fs.readFileSync(filePath);
    const parser = new PDFParse({ data: pdfBuffer });
    const pdfData = await parser.getText();

    extractedText = pdfData.text.toLowerCase();
  } 
  else if (ext === ".jpg" || ext === ".jpeg" || ext === ".png") {
    const processedPath = `${filePath}-processed.png`;

    await sharp(filePath)
      .resize({ width: 1800 })
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
      message: "Only PDF, JPG, JPEG, and PNG files are allowed.",
      matchedKeywords: [],
      extractedText: "",
    };
  }

  const normalizedText = extractedText
    .replace(/\s+/g, "")
    .replace(/[^a-z0-9]/g, "");

  const hasTKR =
    normalizedText.includes("tkrcollegeofengineeringandtechnology") ||
    normalizedText.includes("tkrcollege") ||
    normalizedText.includes("tkrcet") ||
    normalizedText.includes("tkr");

  const memoKeywords = [
    "memorandumofgrade",
    "memorandumofgrades",
    "hallticketno",
    "hallticketnumber",
    "branchspecialization",
    "semesterregularexaminations",
    "semester",
    "sgpa",
    "cgpa",
    "controllerofexaminations",
    "subjectcode",
    "subjecttitle",
    "credits",
    "grade",
    "passed",
  ];

  const studentIdKeywords = [
    "identitycard",
    "idcard",
    "student",
    "rollno",
    "rollnumber",
    "hallticketno",
    "hallticketnumber",
    "department",
    "branch",
    "validity",
    "valid",
    "principal",
  ];

  const matchedMemo = memoKeywords.filter((keyword) =>
    normalizedText.includes(keyword)
  );

  const matchedStudentId = studentIdKeywords.filter((keyword) =>
    normalizedText.includes(keyword)
  );

  console.log("Extracted Text:", extractedText);
  console.log("Normalized Text:", normalizedText);
  console.log("Has TKR:", hasTKR);
  console.log("Matched Memo:", matchedMemo);
  console.log("Matched Student ID:", matchedStudentId);

  // TKR is mandatory for marks memo
  const isTKRMemo = hasTKR && matchedMemo.length >= 2;

  // TKR is mandatory for old student ID
  const isTKRStudentId = hasTKR && matchedStudentId.length >= 2;

  const allMatchedKeywords = [
    ...matchedMemo,
    ...matchedStudentId,
  ];

  if (isTKRMemo || isTKRStudentId) {
    return {
      success: true,
      documentType: isTKRMemo
        ? "TKR Marks Memo"
        : "TKR Student ID Card",
      message: "Document accepted successfully.",
      matchedKeywords: allMatchedKeywords,
      extractedText,
    };
  }

  if ((matchedMemo.length >= 4 || matchedStudentId.length >= 3) && !hasTKR) {
    return {
      success: false,
      message: "Student ID or marks memo must belong to TKR College.",
      matchedKeywords: allMatchedKeywords,
      extractedText,
    };
  }

  return {
    success: false,
    message: "Please upload only TKR marks memo or TKR student ID card.",
    matchedKeywords: allMatchedKeywords,
    extractedText,
  };
};

module.exports = validateAlumniMemo;