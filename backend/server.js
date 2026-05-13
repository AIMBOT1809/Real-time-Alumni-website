const express =
require("express");

const cors =
require("cors");

const validateRoutes =
require("./validateRoutes");

const app =
express();

app.use(cors());

app.use(express.json());

app.use(
    "/api",
    validateRoutes
);

app.get("/", (req,res)=>{

    res.send(
        "Backend Working"
    );
});

app.listen(5000, ()=>{

    console.log(
        "Server running on port 5000"
    );
});