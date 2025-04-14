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

function dirExists(filepath, dirIndex) {
    if (dirIndex == 0) {
        dirIndex += 1
        filepath = `${filepath} (${dirIndex})`
    } else {
        dirIndex += 1
        filepath = filepath.slice(0, -4)
        filepath = `${filepath} (${dirIndex})`
    }
    try {
        fs.mkdirSync(filepath)
    }
    catch (err) {
        console.log(err.code)
        if (err.code == 'EEXIST') {
            console.log(dirIndex)
            dirExists(filepath, dirIndex)
        }
    }
}

function fileExists(filepath, fileIndex) {
    let fileArr = filepath.split('.')
    console.log(fileArr)
    if (fileIndex == 0) {
        fileIndex += 1
        filepath = `${fileArr[0]} (${fileIndex}).${fileArr[1]}`
    } else {
        fileIndex += 1
        filepath = fileArr[0].slice(0, -4)
        filepath = `${fileArr[0]} (${fileIndex}).${fileArr[1]}`
    }
    try {
        fs.writeFile(filepath, '', (err) => {
            if (err) throw err
            console.log("plik nadpisany");
        })
    }
    catch (err) {
        console.log(err.code)
        if (err.code == 'EEXIST') {
            console.log(fileIndex)
            fileExists(filepath, fileIndex)
        }
    }
}

// GET-y
app.get("/", function (req, res) {
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
    let dirIndex = 0;
    console.log('addFolder');
    console.log(req.body);
    let filepath = path.join(__dirname, "upload", req.body.name);
    console.log(filepath);
    try {
        fs.mkdirSync(filepath);
    }
    catch (err) {
        console.log(err.code);
        if (err.code == 'EEXIST') {
            dirExists(filepath, dirIndex);
        }
    }
    res.render('index.hbs', context);
})

app.post("/addFile", function (req, res) {
    let fileIndex = 0;
    console.log('addFile');
    console.log(req.body);
    const filepath = path.join(__dirname, "upload", req.body.name);
    console.log(filepath);
    if (fs.existsSync(filepath)) {
        fileExists(filepath, fileIndex);
    } else {
        fs.writeFile(filepath, '', (err) => {
            if (err) throw err
            console.log("plik nadpisany");
        })
    }

    res.render('index.hbs', context);
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