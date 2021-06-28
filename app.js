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
const statistics = require("./queries/statistics/statistics");
const user = require("./queries/user/user");
const ide = require("./queries/ide/ide");
const subs = require("./queries/subscriptions/subscriptions");
const cron = require("node-cron");

app.set("view engine", "ejs");

app.use(bodyParser.json());
app.use(express.static("public"));

// ENDPOINT: LOGIN
app.post("/login", login.loginUser);

// ENDPOINT: PROBLEMS
app.route("/problems").get(problems.getAllProblems).post(problems.postProblem);

app.route("/problems/:difficulty").get(problems.getProblemsByDifficulty);

app
  .route("/problems/id/:id")
  .get(problems.getProblemById)
  .put(problems.updateProblemById);

app.route("/ideProblem/").get(problems.getProblemsWithSubmissions);

// ENDPOINT: PAYMENTS
app.route("/payments").post(payments.createPayment);

// ENDPOINT: STATISTICS
app.route("/statistics/:userId").get(statistics.getUserStatistics);

// ENDPOINT: USER
app.route("/user").put(user.editUser);

// ENDPOINT: IDE
app.route("/ide/execute").post(ide.tryCode);

app.route("/ide/send").post(ide.sendCode);

//Chequear subscripciones activas
//Daily 0 0 * * * se ejecuta una vez a media noche
cron.schedule("45 23 * * *", () => {
    subs.checkingSubs();
    console.log("Lmao")
});

app.listen(port, () => {
  console.log("Server started on port 3000");
});
