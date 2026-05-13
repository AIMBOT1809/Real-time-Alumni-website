const Tesseract = require("tesseract.js");

const pdfParse = require("pdf-parse");

const fs = require("fs");

async function validateDocument(file) {

    try {

        let extractedText = "";

        /* =========================
           IMAGE OCR
        ========================== */

        if (file.mimetype.includes("image")) {

            const result =
                await Tesseract.recognize(
                    file.path,
                    "eng"
                );

            extractedText =
                result.data.text.toLowerCase();
        }

        /* =========================
           PDF TEXT EXTRACTION
        ========================== */

        else if (
            file.mimetype === "application/pdf"
        ) {

            const dataBuffer =
                fs.readFileSync(file.path);

            const pdfData =
                await pdfParse(dataBuffer);

            extractedText =
                pdfData.text.toLowerCase();
        }

        console.log(
            "Extracted Text:",
            extractedText
        );

        /* =========================
           COLLEGE ID KEYWORDS
        ========================== */

        const collegeIdKeywords = [
  "college",
  "id",
  "student",
  "roll no",
  "name",
  "father",
  "dob",
  "valid",
  "photo",
  "signature"
  ];

        let score = 0;

        /* =========================
           KEYWORD CHECKING
        ========================== */

        collegeIdKeywords.forEach(word => {

            if (
                extractedText.includes(word)
            ) {

                score++;
            }
        });

        /* =========================
           ROLL NUMBER CHECK
        ========================== */

        const rollRegex =
            /[a-zA-Z0-9]{5,15}/;

        if (
            rollRegex.test(extractedText)
        ) {

            score += 2;
        }

        console.log(
            "College ID Score:",
            score
        );

        /* =========================
           FINAL VALIDATION
        ========================== */

        if (score >= 2) {

            return {

                valid: true,

                type: "college-id",

                message:
                    "Valid College ID Card detected",

                score
            };
        }

        return {

            valid: false,

            message:
                "Invalid College ID Card"
        };

    } catch (error) {

        console.log(error);

        return {

            valid: false,

            message:
                "Validation failed"
        };
    }
}

module.exports = validateCollegeId;