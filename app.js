const bodyParser = require("body-parser");
const ejs = require("ejs");
const express = require("express");
var cors = require("cors");

const app = express();
const port = process.env.PORT || 3000;
app.use(cors());

const login = require("./queries/login/login");
const problems = require("./queries/problems/problems");
const payments = require("./queries/payments/payments.js");

app.set("view engine", "ejs");

app.use(bodyParser.json());
app.use(express.static("public"));

// ENDPOINT: LOGIN
app.post("/login", login.loginUser);

// ENDPOINT: PROBLEMS
app.route("/problems").get(problems.getAllProblems);

app.route("/problems/:difficulty").get(problems.getProblemsByDifficulty);

//ENDPOINT: PAYMENTS
app.route("/payments").post(payments.createPayment);

app.listen(port, () => {
  console.log("Server started on port 3000");
});
