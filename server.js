const express = require("express")
const hbs = require('express-handlebars');
const app = express()
const PORT = 3000;
const path = require("path");
const fs = require("fs")
app.set('views', path.join(__dirname, 'views'));
app.engine('hbs', hbs({ defaultLayout: 'main.hbs' }));
app.set('view engine', 'hbs');
app.use(express.urlencoded({
    extended: true
}));

let context = ""
const dirArr = []
const fileArr = []

// GET-y
app.get("/filemanager", function (req, res) {
    fs.readdir(`${__dirname}\\upload`, (err, files) => {
        if (err) throw err
        console.log("lista", files);

        files.forEach((file) => {
            fs.lstat(`upload/${file}`, (err, stats) => {
                if (err) throw err
                console.log(file, stats.isDirectory());
                if (stats.isDirectory() == true) {
                    console.log('true')
                    dirArr.push(file)
                } else {
                    console.log('false')
                    fileArr.push(file)
                }
                console.log(`Dirs: ${dirArr}`)
                console.log(`Files: ${fileArr}`)
            })
        })
    })
    res.render('index.hbs', context);
})

app.post("/addFolder", function (req, res) {
    console.log('addFolder')
    console.log(req.body)
    const filepath = path.join(__dirname, "upload", req.body.name)
    console.log(filepath)
    try {
        fs.mkdirSync(filepath)
    }
    catch (err) {
        console.log("error", err.message);
    }
    res.render('index.hbs', context)
})

app.post("/addFile", function (req, res) {
    console.log('addFile')
    console.log(req.body)
    const filepath = path.join(__dirname, "upload", req.body.name)
    console.log(filepath)
    fs.writeFile(filepath, '', (err) => {
        if (err) throw err
        console.log("plik nadpisany");
    })
    res.render('index.hbs', context)
})

// app.get("*", function (req, res) {
//     res.render('404.hbs', context);
// })

// Static
app.use(express.static('static'))

// Listening
app.listen(PORT, function () {
    console.log("Serwer aktywowany na porcie: " + PORT)
})