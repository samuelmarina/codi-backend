const bodyParser = require('body-parser');
const ejs = require('ejs');
const express = require('express');

const app = express();
const port = process.env.PORT || 3000;

const login = require('./queries/login/login');

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.static('public'));

// ENDPOINT: LOGIN
app.get("/login", login.loginUser)

app.listen(port, () => {
    console.log("Server started on port 3000");
})