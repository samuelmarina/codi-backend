const bodyParser = require('body-parser');
const ejs = require('ejs');
const express = require('express');
var cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;
app.use(cors());

const login = require('./queries/login/login');
const problems=require('./queries/login/login');


app.set('view engine', 'ejs');

app.use(bodyParser.json());
app.use(express.static('public'));



// ENDPOINT: LOGIN
app.post("/login", login.loginUser);

// ENDPOINT: PROBLEMS
app.get('/problems/:id',problems.getProblemById)




app.listen(port, () => {
    console.log("Server started on port 3000");
})