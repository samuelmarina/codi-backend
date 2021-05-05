const bodyParser = require('body-parser');
const ejs = require('ejs');
const express = require('express');

const app = express();

const login = require('./queries/login/login');

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.static('public'));

// ENDPOINT: LOGIN
app.post("/login", login.loginUser)

app.listen(3000, () => {
    console.log("Server started on port 3000");
})