const express = require("express");
const hbs = require('express-handlebars');
const archiver = require('archiver');
const app = express();
const PORT = 5000;
const path = require("path");
const fs = require("fs");
const formidable = require('formidable');
app.use(express.json());
const mainRoot = "USER_DATA";

app.set('views', path.join(__dirname, 'views'));
app.engine('hbs', hbs({
    defaultLayout: 'main.hbs',
    helpers: {
        splitPath: function (pathStr) {
            const parts = pathStr.split('/');
            let result = [];
            let accumulated = "";
            parts.forEach((part, index) => {
                accumulated += (index === 0 ? "" : "/") + part;
                result.push({ name: part, path: accumulated });
            });
            return result;
        },
        splitPathFile: function (pathStr) {
            const parts = pathStr.split('/');
            parts.pop;
            let result = [];
            let accumulated = "";
            parts.forEach((part, index) => {
                accumulated += (index === 0 ? "" : "/") + part;
                result.push({ name: part, path: accumulated });
            });
            result.pop();
            return result;
        },
        imagesType: function (file) {
            const parts = file.split('.');
            return `gfx/${parts[1]}.png`;
        }
    }
}));
app.set('view engine', 'hbs');
app.use(express.urlencoded({
    extended: true
}));

// Static
app.use(express.static('static'));

let context = {};

function dirExists(filepath, dirIndex) {
    if (dirIndex == 0) {
        dirIndex += 1;
        filepath = `${filepath} (${dirIndex})`;
    } else {
        dirIndex += 1;
        filepath = filepath.slice(0, -4);
        filepath = `${filepath} (${dirIndex})`;
    }
    try {
        fs.mkdirSync(filepath);
    }
    catch (err) {
        console.log(err.code);
        if (err.code == 'EEXIST') {
            console.log(dirIndex);
            dirExists(filepath, dirIndex);
        }
    }
}

function fileExists(filepath, fileIndex) {
    let fileArr = filepath.split('.');
    console.log(fileArr);
    if (fileIndex == 0) {
        fileIndex += 1;
        filepath = `${fileArr[0]} (${fileIndex}).${fileArr[1]}`;
    } else {
        fileIndex += 1;
        filepath = fileArr[0].slice(0, -4);
        filepath = `${fileArr[0]} (${fileIndex}).${fileArr[1]}`;
    }
    try {
        fs.writeFile(filepath, '', (err) => {
            if (err) throw err
            console.log("plik nadpisany");
        })
    }
    catch (err) {
        console.log(err.code);
        if (err.code == 'EEXIST') {
            console.log(fileIndex);
            fileExists(filepath, fileIndex);
        }
    }
}

// GET-y
app.get("/", function (req, res) {
    let root = req.query.root || mainRoot;
    let dirArr = [];
    let fileArr = [];

    fs.readdir(path.join(__dirname, root), (err, files) => {
        if (err) throw err;

        let statPromises = files.map(file => {
            return new Promise((resolve) => {
                let fullPath = path.join(__dirname, root, file);
                fs.lstat(fullPath, (err, stats) => {
                    if (err) return resolve();
                    if (stats.isDirectory()) dirArr.push(file);
                    else fileArr.push(file);
                    resolve();
                });
            });
        });

        Promise.all(statPromises).then(() => {
            dirArr.sort();
            fileArr.sort();
            context = {
                folders: dirArr,
                files: fileArr,
                root: root
            };
            console.log(context)
            res.render('index.hbs', context);
        });
    });
});

app.post("/addFolder", function (req, res) {
    let dirIndex = 0;
    console.log('addFolder');
    console.log(req.body);
    const root = req.body.root || mainRoot;
    const folderName = req.body.name;
    const filepath = path.join(__dirname, root, folderName);
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
    res.redirect(`/?root=${root}`);
});

app.post("/addFile", function (req, res) {
    let fileIndex = 0;
    let content = '';
    console.log('addFile');
    console.log(req.body);
    const root = req.body.root || mainRoot;
    const fileName = req.body.name + req.body.extension;
    console.log(req.body.extension)
    const filepath = path.join(__dirname, root, fileName);
    console.log(filepath);
    console.log(req.body.extension)

    switch (req.body.extension) {
        case '.txt':
            content = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce in eros lorem. Integer sed magna leo. Aliquam accumsan ut ligula id interdum. Curabitur porttitor ac ligula eu faucibus. In ex dolor, fermentum nec eros nec, porta aliquam leo. Sed hendrerit venenatis neque id hendrerit. Nam elementum rhoncus quam at scelerisque. In nec vulputate lorem. Duis lacus mauris, malesuada et leo eu, auctor sagittis magna. Integer eleifend eros at fermentum laoreet. Vivamus porta ex augue, eu consequat magna fermentum at. Etiam vel nisl massa. Phasellus eleifend, orci eu accumsan placerat, odio lectus ornare neque, et rutrum ligula diam sed nibh. Vestibulum gravida risus a arcu condimentum porttitor. Quisque non arcu elit.';
            break;
        case '.css':
            content = `* {
    padding: 0;
    margin: 0;
    box-sizing: border-box;
}`;
            break;
        case '.js':
            content = 'console.log("Hello World!")';
            break;
        case '.json':
            content = `{
    "name": "John",
    "surname": "Doe"
}`
            break;
        case '.html':
            content = `<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="/css/style.css">
        <script src="/js/script.js" defer></script>
        <title>Document</title>
    </head>
    <body>
        <h1>Hello world</h1>
    </body>
</html>`
            break;
    }
    console.log(content)

    if (fs.existsSync(filepath)) {
        fileExists(filepath, fileIndex);
    } else {
        fs.writeFile(filepath, content, (err) => {
            if (err) throw err;
            console.log("plik zapisany");
        });
    }
    res.redirect(`/?root=${root}`);
});

app.post('/uploadMultipleFiles', function (req, res) {
    const form = formidable({ multiples: true, uploadDir: path.join(__dirname, 'FILES') });

    form.parse(req, (err, fields, files) => {
        if (err) {
            console.error('Form parse error:', err);
            return res.status(500).send('Error parsing the form');
        }

        console.log('FIELDS:', fields);
        console.log('FILES:', files);

        const root = fields.root || mainRoot;
        let uploadedFiles = files.upload;

        if (!Array.isArray(uploadedFiles)) {
            uploadedFiles = [uploadedFiles];
        }

        uploadedFiles.forEach(file => {
            const oldPath = file.path;
            const newFolderPath = path.join(__dirname, root);
            const newPath = path.join(newFolderPath, file.name);

            console.log('Moving file:', oldPath, 'to', newPath);

            if (!fs.existsSync(newFolderPath)) {
                fs.mkdirSync(newFolderPath, { recursive: true });
                console.log(`Created folder: ${newFolderPath}`);
            }

            fs.rename(oldPath, newPath, (err) => {
                if (err) throw err;
                console.log('File saved:', newPath);
            });
        });

        res.redirect(`/?root=${root}`);
    });
});

app.get("/deleteDir", function (req, res) {
    const dir = req.query.dir;
    const root = req.query.root || mainRoot;
    const filepath = path.join(__dirname, root, dir);
    console.log(`Usuwanie katalogu: ${filepath}`);

    fs.rmdir(filepath, { recursive: true }, (err) => {
        if (err) throw err;
        console.log(`Usunięto katalog: ${filepath}`);
        res.redirect(`/?root=${root}`);
    });
});

app.get("/deleteFile", function (req, res) {
    const file = req.query.file;
    const root = req.query.root || mainRoot;
    const filepath = path.join(__dirname, root, file);
    console.log(`Usuwanie pliku: ${filepath}`);

    fs.unlink(filepath, (err) => {
        if (err) throw err;
        console.log(`Usunięto plik: ${filepath}`);
        res.redirect(`/?root=${root}`);
    });
});

app.get("/downloadFile", function (req, res) {
    const file = req.query.file;
    const root = req.query.root || mainRoot;
    const filepath = path.join(__dirname, root, file);
    console.log(`Pobieranie pliku: ${filepath}`);

    res.download(filepath, (err) => {
        if (err) throw err
        console.log(`Pobrano plik: ${filepath}`);
    })
})

app.get("/downloadDir", function (req, res) {
    const dir = req.query.dir;
    const root = req.query.root || mainRoot;
    const dirPath = path.join(__dirname, root, dir);
    const zipName = `${dir}.zip`;

    res.setHeader('Content-Disposition', `attachment; filename=${zipName}`);
    res.setHeader('Content-Type', 'application/zip');

    const archive = archiver('zip', { zlib: { level: 9 } });
    archive.on('error', (err) => {
        console.error(`Błąd archiwizacji: ${err.message}`);
        res.status(500).send("Błąd tworzenia archiwum");
    });

    archive.pipe(res);
    archive.directory(dirPath, false);
    archive.finalize();

    console.log(`Rozpoczęto pakowanie folderu: ${dirPath}`);
});

app.post("/renameFolder", function (req, res) {
    if (req.body.root == 'FILES') {
        console.log('Nie można zmieniać nazwy roota');
        return res.redirect(`/`);
    }
    console.log('req.body');
    console.log(req.body);
    const oldName = req.body.oldName;
    console.log('Old Folder Name:', oldName);
    const newName = req.body.newName;
    console.log('New Folder Name:', newName);
    const root = req.body.root || mainRoot;
    console.log('Root:', root);

    const oldPath = path.join(__dirname, root, oldName);
    console.log('Old Path:', oldPath);

    let lastBackslashIndex = oldPath.lastIndexOf("\\");
    let newPath = oldPath.slice(0, lastBackslashIndex);

    const filesIndex = oldPath.indexOf("FILES\\");
    const upToLastBackslash = oldPath.lastIndexOf("\\");
    let newRoot = oldPath.slice(filesIndex, upToLastBackslash + 1);
    newRoot = newRoot.slice(0, -1)

    console.log('newRoot:', newRoot);

    newPath = path.join(newPath, newName)
    console.log('New Path:', newPath);

    fs.readdir(path.join(__dirname, root), (err, files) => {
        if (err) {
            console.error("Error reading directory:", err);
            return res.status(500).send("Error reading directory");
        }

        if (files.includes(newName)) {
            return res.redirect(`/?root=${root}&error=Folder already exists`);
        }

        fs.rename(oldPath, newPath, (err) => {
            if (err) {
                console.error("Error renaming folder:", err);
                console.log('Error code: ')
                console.log(err.code)
                if (err.code == 'EPERM') {
                    dirExists(oldPath, 0)
                    console.log(`Folder renamed to ${newName}`);
                    return res.redirect(`/?root=${newRoot}`);
                } else {
                    return res.status(500).send("Error renaming folder");
                }
            }
            console.log(`Folder renamed to ${newName}`);
            return res.redirect(`/?root=${newRoot}`);
        });
    });
});

app.get('/editFile', function (req, res) {
    context = {}
    console.log(req.query);
    let root = req.query.root
    console.log(root);
    context.root = root;
    console.log(context);
    res.render('editor.hbs', context);
})

app.post('/getFileData', function (req, res) {
    const root = req.body.root;

    if (!root) {
        return res.status(400).json({ error: 'No file path provided' });
    }

    fs.readFile(root, 'utf8', (err, data) => {
        if (err) {
            console.error('File read error:', err);
            return res.status(500).json({ error: 'Failed to read file' });
        }

        console.log("Data from file:\n", data);
        const value = data.split("\n");
        res.json({
            value: data,
            lines: value.length
        });
    });
});

app.post('/saveFileData', function (req, res) {
    const { root, value } = req.body;

    console.log(root)
    console.log(value)

    if (!root || typeof value !== 'string') {
        return res.status(400).json({ error: 'Invalid input' });
    }

    fs.writeFile(root, value, 'utf8', (err) => {
        if (err) {
            console.error('File write error:', err);
            return res.status(500).json({ error: 'Failed to write file' });
        }

        console.log(`File saved: ${root}`);
        res.json({ success: true });
    });
});


app.get("*", function (req, res) {
    const context = {
        page: req.originalUrl
    };
    console.log('Requested URL:', req.originalUrl);
    res.status(404).render('404.hbs', context);
});

// Listening
app.listen(PORT, function () {
    console.log("Serwer aktywowany na porcie: " + PORT);
})