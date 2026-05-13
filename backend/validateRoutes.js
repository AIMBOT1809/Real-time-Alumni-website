const express =
require("express");

const multer =
require("multer");

const router =
express.Router();

/* TEST FUNCTIONS */

async function validateCollegeId(file){

    return {

        valid:true,

        message:
        "College ID Working"
    };
}

async function validateResume(file){

    return {

        valid:true,

        message:
        "Resume Working"
    };
}

/* MULTER */

const upload =
multer({

    dest:"uploads/"
});

/* TEST ROUTE */

router.get("/", (req,res)=>{

    res.send(
        "Routes Working"
    );
});

/* COLLEGE ID */

router.post(

    "/validate-id",

    upload.single("document"),

    async (req,res)=>{

        const result =
            await validateCollegeId(
                req.file
            );

        res.json(result);
    }
);

/* RESUME */

router.post(

    "/validate-resume",

    upload.single("document"),

    async (req,res)=>{

        const result =
            await validateResume(
                req.file
            );

        res.json(result);
    }
);

module.exports =
router;