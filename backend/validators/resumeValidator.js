const Tesseract =
require("tesseract.js");

const pdfParse =
require("pdf-parse");

const mammoth =
require("mammoth");

const fs =
require("fs");

async function validateResume(file){

    try{

        let extractedText = "";

        /* IMAGE RESUME */

        if(
            file.mimetype.includes("image")
        ){

            const result =
                await Tesseract.recognize(
                    file.path,
                    "eng"
                );

            extractedText =
                result.data.text.toLowerCase();
        }

        /* PDF RESUME */

        else if(
    file.mimetype ===
    "application/pdf"
){

    const result =
        await Tesseract.recognize(
            file.path,
            "eng"
        );

    extractedText =
        result.data.text.toLowerCase();
}

        /* DOCX RESUME */

        else if(

            file.mimetype ===
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"

        ){

            const result =
                await mammoth.extractRawText({

                    path:file.path
                });

            extractedText =
                result.value.toLowerCase();
        }

        console.log(
            "Resume Text:",
            extractedText
        );

        const resumeKeywords = [

            "profile",
            "education",
            "skills",
            "projects",
            "experience",
            "certifications",
            "objective",
            "resume"

        ];

        let score = 0;

        resumeKeywords.forEach(word=>{

            if(
                extractedText.includes(word)
            ){

                score++;
            }
        });

        console.log(
            "Resume Score:",
            score
        );

        if(

            score >= 2

            &&

            extractedText.includes(
                "education"
            )

            &&

            extractedText.includes(
                "skills"
            )

        ){

            return {

                valid:true,

                message:
                "Valid Resume",

                score
            };
        }

        return {

            valid:false,

            message:
            "Invalid Resume"
        };

    }catch(error){

        console.log(error);

        return {

            valid:false,

            message:
            "Validation failed"
        };
    }
}

module.exports =
validateResume;