const express = require("express")
const hbs = require('express-handlebars');
const app = express()
const PORT = 3000;
const path = require("path");
app.set('views', path.join(__dirname, 'views'));
app.engine('hbs', hbs({ defaultLayout: 'main.hbs' }));
app.set('view engine', 'hbs');
app.use(express.urlencoded({
    extended: true
}));

const context = ""

// GET-y
app.get("/", function (req, res) {
    res.render('index.hbs', context);
})

// Static
app.use(express.static('static'))

// Listening
app.listen(PORT, function () {
    console.log("Serwer aktywowany na porcie: " + PORT)
})