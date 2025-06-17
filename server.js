// Const dla serwera
const express = require("express");
const hbs = require('express-handlebars');
const archiver = require('archiver');
const app = express();
const PORT = 5000;
const path = require("path");
const fs = require("fs");
const formidable = require('formidable');
const bcryptjs = require("bcryptjs");
const { hash, compare } = bcryptjs;
const cookieParser = require("cookie-parser");
const nocache = require("nocache");

// DLC dla app
app.use(express.json());
app.use(cookieParser());
app.use(nocache());

const mainRoot = "USER_DATA";
const userFilePath = path.join(__dirname, 'USER_BASE', 'data.json');

// Setup HBS-a
app.set('views', path.join(__dirname, 'views'));
app.engine('hbs', hbs({
    defaultLayout: 'main.hbs',
    helpers: {
        splitPath: function (pathStr) {
            pathStr = pathStr.replace(/\\/g, '/');
            const parts = pathStr.split('/');
            parts.shift();
            parts.shift();
            let result = [];
            let accumulated = "";
            parts.forEach((part, index) => {
                accumulated += (index === 0 ? "" : "/") + part;
                result.push({ name: part, path: accumulated });
            });
            return result;
        },
        splitPathFile: function (pathStr) {
            pathStr = pathStr.replace(/\\/g, '/');
            const parts = pathStr.split('/');
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
            if (parts[1] == 'css' || parts[1] == 'js' || parts[1] == 'json' || parts[1] == 'html' || parts[1] == 'txt')
                return `gfx/${parts[1]}.png`;
            else
                return 'gfx/img.png';
        }
    }
}));
app.set('view engine', 'hbs');
app.use(express.urlencoded({
    extended: true
}));

app.use(express.static('static'));

let context = {};

// Funkcje
function dirExists(filepath, dirIndex) {
    let currentPath = filepath;
    if (dirIndex > 0) {
        const lastParenIndex = currentPath.lastIndexOf(' (');
        if (lastParenIndex !== -1) {
            currentPath = currentPath.substring(0, lastParenIndex);
        }
    }

    dirIndex += 1;
    currentPath = `${currentPath} (${dirIndex})`;

    try {
        fs.mkdirSync(currentPath);
    }
    catch (err) {
        console.log(err.code);
        if (err.code == 'EEXIST') {
            console.log(dirIndex);
            dirExists(filepath, dirIndex); // Pass the original filepath for consistent base
        } else {
            console.error("Error creating directory:", err);
            // Handle other errors if necessary
        }
    }
}

function getUniqueFileName(dir, baseName, extension, index = 1) {
    let newName = `${baseName} (${index})${extension}`;
    let fullPath = path.join(dir, newName);

    if (fs.existsSync(fullPath)) {
        return getUniqueFileName(dir, baseName, extension, index + 1);
    }
    return newName;
}

function fileExists(filepath, fileIndex) {
    let currentPath = filepath;
    let baseName = path.basename(filepath, path.extname(filepath));
    let extension = path.extname(filepath);

    if (fileIndex > 0) {
        const lastParenIndex = baseName.lastIndexOf(' (');
        if (lastParenIndex !== -1) {
            baseName = baseName.substring(0, lastParenIndex);
        }
    }

    fileIndex += 1;
    let newFileName = `${baseName} (${fileIndex})${extension}`;
    currentPath = path.join(path.dirname(filepath), newFileName);

    if (fs.existsSync(currentPath)) {
        fileExists(filepath, fileIndex);
    } else {
        fs.writeFile(currentPath, '', (err) => {
            if (err) throw err;
            console.log("Unique file created:", currentPath);
        });
    }
}

async function readUsers() {
    try {
        const data = await fs.promises.readFile(userFilePath, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        if (err.code === 'ENOENT' || err instanceof SyntaxError) {
            return [];
        }
        console.error('Błąd odczytu pliku:', err);
        return [];
    }
}

async function writeUsers(users) {
    try {
        await fs.promises.writeFile(userFilePath, JSON.stringify(users, null, 2), 'utf8');
    } catch (err) {
        console.error('Błąd zapisu pliku:', err);
    }
}

// Middleware do blokowania bez loginu
app.use((req, res, next) => {
    const publicRoutes = ['/login', '/register', '/loginUser', '/registerUser', '/404'];

    if (publicRoutes.includes(req.path)) {
        return next();
    }

    const userLogin = req.cookies.userLogin;
    if (userLogin) {
        req.userRoot = path.join(mainRoot, userLogin, 'Files');
        next();
    } else {
        res.redirect('/login');
    }
});

// GET-y
app.get("/", function (req, res) {
    let root = req.query.root || req.userRoot;

    const userFilesBasePath = path.join(mainRoot, req.cookies.userLogin, 'Files').replace(/\\/g, '/');

    root = root.replace(/\\/g, '/');

    if (!root.startsWith(userFilesBasePath)) {
        root = req.userRoot.replace(/\\/g, '/');
        console.warn(`User ${req.cookies.userLogin} attempted to access outside their root. Resetting to ${root}`);
    }

    let error = req.query.error;
    if (error == 'CONFIG_DELETE') {
        error = "Can't delete config.json";
    }
    let dirArr = [];
    let fileArr = [];

    const userLogin = req.cookies.userLogin;
    context.loggedInUser = userLogin;

    fs.readdir(path.join(__dirname, root), (err, files) => {
        if (err) {
            console.error('Error reading directory:', err);
            if (err.code === 'ENOENT') {
                return res.redirect(`/?root=${req.userRoot.replace(/\\/g, '/')}`);
            }
            return res.status(500).send("Error reading directory.");
        }

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
                root: root,
                error: error,
                loggedInUser: userLogin,
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
    const root = req.body.root || req.userRoot;
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
    const urlRoot = root.replace(/\\/g, '/');
    res.redirect(`/?root=${urlRoot}`);
});

app.post("/addFile", function (req, res) {
    let fileIndex = 0;
    let content = '';
    console.log('addFile');
    console.log(req.body);
    const root = req.body.root || req.userRoot;
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
        default:
            content = '';
            break;
    }
    console.log(content)

    fs.promises.access(filepath, fs.constants.F_OK)
        .then(() => {
            const { name: baseName, ext: extension } = path.parse(fileName);
            const uniqueFileName = getUniqueFileName(path.join(__dirname, root), baseName, extension);
            const uniqueFilepath = path.join(__dirname, root, uniqueFileName);
            fs.writeFile(uniqueFilepath, content, (err) => {
                if (err) throw err;
                console.log("Unique file created:", uniqueFilepath);
                res.redirect(`/?root=${root.replace(/\\/g, '/')}`);
            });
        })
        .catch(() => {
            fs.writeFile(filepath, content, (err) => {
                if (err) throw err;
                console.log("File saved:", filepath);
                res.redirect(`/?root=${root.replace(/\\/g, '/')}`);
            });
        });
});

app.post('/uploadMultipleFiles', function (req, res) {
    const form = formidable({ multiples: true, uploadDir: path.join(__dirname, 'temp_uploads') });

    const tempUploadDir = path.join(__dirname, 'temp_uploads');
    if (!fs.existsSync(tempUploadDir)) {
        fs.mkdirSync(tempUploadDir, { recursive: true });
    }

    form.parse(req, (err, fields, files) => {
        if (err) {
            console.error('Form parse error:', err);
            return res.status(500).send('Error parsing the form');
        }

        let submittedRoot = '';
        if (fields.root) {
            if (Array.isArray(fields.root)) {
                submittedRoot = fields.root[0] || '';
            } else {
                submittedRoot = fields.root;
            }
        }
        let targetRoot = req.userRoot;

        const userLogin = req.cookies.userLogin;
        if (!userLogin) {
            console.warn("Upload attempted by unauthenticated user.");
            return res.status(401).send("Unauthorized: Please log in.");
        }
        const userUploadBaseDir = path.join(__dirname, req.userRoot);

        if (submittedRoot) {
            const proposedAbsolutePath = path.join(__dirname, submittedRoot);
            const proposedAbsolutePathNormalized = path.normalize(proposedAbsolutePath).replace(/\\/g, '/');
            const userUploadBaseDirNormalized = path.normalize(userUploadBaseDir).replace(/\\/g, '/');

            if (proposedAbsolutePathNormalized.startsWith(userUploadBaseDirNormalized)) {
                targetRoot = proposedAbsolutePath;
            } else {
                console.warn(`User ${userLogin} attempted to upload outside their designated 'Files' root with submitted path: "${submittedRoot}". Resetting to default user upload root: ${userUploadBaseDir}`);
                targetRoot = userUploadBaseDir;
            }
        } else {
            targetRoot = userUploadBaseDir;
        }

        const finalTargetRootNormalized = path.normalize(targetRoot).replace(/\\/g, '/');
        const userUploadBaseDirNormalized = path.normalize(userUploadBaseDir).replace(/\\/g, '/');

        if (!finalTargetRootNormalized.startsWith(userUploadBaseDirNormalized)) {
            console.error(`CRITICAL SECURITY ALERT: Final calculated targetRoot (${targetRoot}) is outside user's designated upload base (${userUploadBaseDir}). Resetting.`);
            targetRoot = userUploadBaseDir;
        }


        let uploadedFiles = files.upload;

        if (!uploadedFiles || (Array.isArray(uploadedFiles) && uploadedFiles.length === 0) || (uploadedFiles.length === 1 && uploadedFiles[0].name === null)) {
            console.log('No actual files selected for upload via form input.');
            const clientRedirectRoot = targetRoot.replace(path.join(__dirname, path.sep), '').replace(/\\/g, '/');
            return res.redirect(`/?root=${clientRedirectRoot}`);
        }

        if (!Array.isArray(uploadedFiles)) {
            uploadedFiles = [uploadedFiles];
        }

        uploadedFiles.forEach(file => {
            if (file && file.path && file.name) {
                const oldPath = file.path;
                const newFolderPath = targetRoot;
                const newFileName = file.name;
                let newPath = path.join(newFolderPath, newFileName);

                console.log('Attempting to move file from:', oldPath, 'to:', newPath);

                if (!fs.existsSync(newFolderPath)) {
                    fs.mkdirSync(newFolderPath, { recursive: true });
                    console.log(`Created folder: ${newFolderPath}`);
                }

                if (fs.existsSync(newPath)) {
                    const { name: baseName, ext: extension } = path.parse(newFileName);
                    const uniqueFileName = getUniqueFileName(newFolderPath, baseName, extension);
                    newPath = path.join(newFolderPath, uniqueFileName);
                    console.log(`File ${newFileName} already exists. Using unique name: ${uniqueFileName}`);
                }

                fs.rename(oldPath, newPath, (renameErr) => {
                    if (renameErr) {
                        console.error(`Error moving file ${oldPath} to ${newPath}:`, renameErr);
                        fs.unlink(oldPath, (unlinkErr) => {
                            if (unlinkErr) console.error('Error deleting temp file after failed rename:', unlinkErr);
                        });
                    } else {
                        console.log(`File saved: ${newPath}`);
                    }
                });
            } else {
                console.warn('Skipping an unexpected invalid file object (missing path or name):', file);
            }
        });

        const clientRedirectRoot = targetRoot.replace(path.join(__dirname, path.sep), '').replace(/\\/g, '/');
        res.redirect(`/?root=${clientRedirectRoot}`);
    });
});

app.get("/deleteDir", function (req, res) {
    const dir = req.query.dir;
    const root = req.query.root || req.userRoot;
    const filepath = path.join(__dirname, root, dir);
    console.log(`Usuwanie katalogu: ${filepath}`);

    const userRootNormalized = path.join(__dirname, req.userRoot).replace(/\\/g, '/');
    const filepathNormalized = filepath.replace(/\\/g, '/');

    if (!filepathNormalized.startsWith(userRootNormalized)) {
        console.warn(`User ${req.cookies.userLogin} attempted to delete outside their root: ${filepath}`);
        return res.status(403).send("Access Denied: Cannot delete outside your designated folder.");
    }

    fs.rmdir(filepath, { recursive: true }, (err) => {
        if (err) {
            console.error("Error deleting directory:", err);
            return res.status(500).send("Error deleting directory.");
        }
        console.log(`Usunięto katalog: ${filepath}`);
        res.redirect(`/?root=${root.replace(/\\/g, '/')}`);
    });
});

app.get("/deleteFile", function (req, res) {
    const file = req.query.file;
    const root = req.query.root || req.userRoot;

    const filepath = path.join(__dirname, root, file);
    const userConfigPath = path.join(__dirname, mainRoot, req.cookies.userLogin, 'Configuration', 'config.json');

    const filepathNormalized = filepath.replace(/\\/g, '/');
    const userConfigPathNormalized = userConfigPath.replace(/\\/g, '/');
    const userRootNormalized = path.join(__dirname, req.userRoot).replace(/\\/g, '/');

    if (filepathNormalized === userConfigPathNormalized) {
        return res.redirect(`/?root=${root.replace(/\\/g, '/')}&error=CONFIG_DELETE`);
    }

    if (!filepathNormalized.startsWith(userRootNormalized)) {
        console.warn(`User ${req.cookies.userLogin} attempted to delete outside their root: ${filepath}`);
        return res.status(403).send("Access Denied: Cannot delete outside your designated folder.");
    }

    console.log(`Usuwanie pliku: ${filepath}`);
    fs.unlink(filepath, (err) => {
        if (err) {
            console.error("Error deleting file:", err);
            return res.status(500).send("Error deleting file.");
        }
        console.log(`Usunięto plik: ${filepath}`);
        res.redirect(`/?root=${root.replace(/\\/g, '/')}`);
    });
});

app.get("/downloadFile", function (req, res) {
    const file = req.query.file;
    const root = req.query.root || req.userRoot;
    const filepath = path.join(__dirname, root, file);
    console.log(`Pobieranie pliku: ${filepath}`);

    const userRootNormalized = path.join(__dirname, req.userRoot).replace(/\\/g, '/');
    const filepathNormalized = filepath.replace(/\\/g, '/');

    if (!filepathNormalized.startsWith(userRootNormalized)) {
        console.warn(`User ${req.cookies.userLogin} attempted to download outside their root: ${filepath}`);
        return res.status(403).send("Access Denied: Cannot download outside your designated folder.");
    }

    res.download(filepath, (err) => {
        if (err) {
            console.error("Error downloading file:", err);
            if (err.code === 'ENOENT') {
                return res.status(404).send("File not found.");
            }
            return res.status(500).send("Error during file download.");
        }
        console.log(`Pobrano pliku: ${filepath}`);
    })
})

app.get("/downloadDir", function (req, res) {
    const dir = req.query.dir;
    const root = req.query.root || req.userRoot;
    const dirPath = path.join(__dirname, root, dir);
    const zipName = `${dir}.zip`;

    const userRootNormalized = path.join(__dirname, req.userRoot).replace(/\\/g, '/');
    const dirPathNormalized = dirPath.replace(/\\/g, '/');

    if (!dirPathNormalized.startsWith(userRootNormalized)) {
        console.warn(`User ${req.cookies.userLogin} attempted to download directory outside their root: ${dirPath}`);
        return res.status(403).send("Access Denied: Cannot download directory outside your designated folder.");
    }

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
    const userBaseFolder = path.join(mainRoot, req.cookies.userLogin);
    const userFilesFolder = path.join(userBaseFolder, 'Files');
    const userConfigFolder = path.join(userBaseFolder, 'Configuration');

    const oldName = req.body.oldName;
    const root = req.body.root || req.userRoot;
    const oldPath = path.join(__dirname, root, oldName);

    const oldPathNormalized = oldPath.replace(/\\/g, '/');
    const userFilesFolderNormalized = path.join(__dirname, userFilesFolder).replace(/\\/g, '/');
    const userConfigFolderNormalized = path.join(__dirname, userConfigFolder).replace(/\\/g, '/');
    const userRootNormalized = path.join(__dirname, req.userRoot).replace(/\\/g, '/');


    if (oldPathNormalized === userFilesFolderNormalized || oldPathNormalized === userConfigFolderNormalized) {
        console.log(`User ${req.cookies.userLogin} tried to rename a protected folder: ${oldPath}`);
        return res.status(403).send("Access Denied: Cannot rename core user folders (Files, Configuration).");
    }

    if (!oldPathNormalized.startsWith(userRootNormalized)) {
        console.warn(`User ${req.cookies.userLogin} attempted to rename folder outside their root: ${oldPath}`);
        return res.status(403).send("Access Denied: Cannot rename outside your designated folder.");
    }

    console.log('Old Folder Name:', oldName);
    const newName = req.body.newName;
    console.log('New Folder Name:', newName);
    console.log('Root:', root);
    console.log('Old Path:', oldPath);

    const parentDirPath = path.dirname(oldPath);
    const newFullPath = path.join(parentDirPath, newName);
    console.log('New Full Path:', newFullPath);

    const redirectRoot = path.dirname(oldPath.replace(__dirname + path.sep, '')).replace(/\\/g, '/');

    fs.readdir(path.join(__dirname, root), (err, files) => {
        if (err) {
            console.error("Error reading directory:", err);
            return res.status(500).send("Error reading directory");
        }

        if (files.includes(newName)) {
            return res.redirect(`/?root=${root.replace(/\\/g, '/')}&error=Folder already exists`);
        }

        fs.rename(oldPath, newFullPath, (err) => {
            if (err) {
                console.error("Error renaming folder:", err);
                console.log('Error code: ')
                console.log(err.code)
                if (err.code == 'EPERM' || err.code === 'EINVAL') {
                    return res.status(500).send("Permission denied or unexpected error during rename.");
                } else {
                    return res.status(500).send("Error renaming folder");
                }
            }
            console.log(`Folder renamed to ${newName}`);
            return res.redirect(`/?root=${redirectRoot}`);
        });
    });
});

app.post("/renameFile", function (req, res) {
    const root = req.body.root || req.userRoot;
    let newName = req.body.newName;

    if (!newName) {
        return res.status(400).send("Missing file name");
    }

    const parentDir = path.dirname(root);
    const oldFileName = path.basename(root);
    const oldPath = path.join(__dirname, root);

    const oldPathNormalized = oldPath.replace(/\\/g, '/');
    const userRootNormalized = path.join(__dirname, req.userRoot).replace(/\\/g, '/');
    const userConfigPathNormalized = path.join(__dirname, mainRoot, req.cookies.userLogin, 'Configuration', 'config.json').replace(/\\/g, '/');

    if (!oldPathNormalized.startsWith(userRootNormalized)) {
        console.warn(`User ${req.cookies.userLogin} attempted to rename file outside their root: ${oldPath}`);
        return res.status(403).send("Access Denied: Cannot rename outside your designated folder.");
    }

    if (oldPathNormalized === userConfigPathNormalized) {
        return res.status(403).send("Access Denied: Cannot rename config.json.");
    }

    let nameParts = oldFileName.split('.');
    let extension = "";
    if (nameParts.length > 1) {
        extension = '.' + nameParts.pop();
    }
    const baseNewName = newName;

    const dirPath = path.join(__dirname, parentDir);

    let finalName = baseNewName + extension;
    let newPath = path.join(dirPath, finalName);

    if (fs.existsSync(newPath)) {
        const uniqueName = getUniqueFileName(dirPath, baseNewName, extension);
        newPath = path.join(dirPath, uniqueName);
        finalName = uniqueName;
    }

    fs.rename(oldPath, newPath, (err) => {
        if (err) {
            console.error("Error renaming file:", err);
            return res.status(500).send("Error renaming file");
        }

        console.log(`File renamed from ${oldFileName} to ${finalName}`);
        return res.redirect(`/?root=${parentDir.replace(/\\/g, '/')}`);
    });
});


app.get('/editFile', function (req, res) {
    context = {}
    console.log(req.query);
    let root = req.query.root

    const fullFilePath = path.join(__dirname, root);

    const fullFilePathNormalized = fullFilePath.replace(/\\/g, '/');
    const userRootNormalized = path.join(__dirname, req.userRoot).replace(/\\/g, '/');

    if (!fullFilePathNormalized.startsWith(userRootNormalized)) {
        console.warn(`User ${req.cookies.userLogin} attempted to edit file outside their root: ${fullFilePath}`);
        return res.status(403).send("Access Denied: Cannot edit files outside your designated folder.");
    }

    const userConfigPathNormalized = path.join(__dirname, mainRoot, req.cookies.userLogin, 'Configuration', 'config.json').replace(/\\/g, '/');
    if (fullFilePathNormalized === userConfigPathNormalized) {
        console.warn(`User ${req.cookies.userLogin} attempted to edit config.json via /editFile.`);
        return res.status(403).send("Access Denied: Edit config via settings.");
    }

    console.log(root);
    context.root = root.replace(/\\/g, '/');
    context.loggedInUser = req.cookies.userLogin;
    console.log(context);
    res.render('textEditor.hbs', context);
})

app.post('/getFileData', function (req, res) {
    const root = req.body.root;

    const userLogin = req.cookies.userLogin;
    const configRoot = path.join(__dirname, mainRoot, userLogin, 'Configuration', 'config.json');

    const requestedFilePath = path.join(__dirname, root);

    const requestedFilePathNormalized = requestedFilePath.replace(/\\/g, '/');
    const userBaseRootNormalized = path.join(__dirname, mainRoot, userLogin).replace(/\\/g, '/');

    if (!requestedFilePathNormalized.startsWith(userBaseRootNormalized)) {
        console.warn(`User ${userLogin} attempted to get data from file outside their root: ${requestedFilePath}`);
        return res.status(403).json({ error: 'Access Denied: Cannot access files outside your designated folder.' });
    }

    if (!root) {
        return res.status(400).json({ error: 'No file path provided' });
    }

    fs.readFile(requestedFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('File read error:', err);
            return res.status(500).json({ error: 'Failed to read file' });
        }

        console.log("Data from file:\n", data);
        const value = data.split("\n");


        fs.readFile(configRoot, 'utf8', (err, configData) => {
            if (err) {
                console.error('File read error:', err);
                if (err.code === 'ENOENT') {
                    console.log('User config.json not found, providing default.');
                    return res.json({
                        value: data,
                        lines: value.length,
                        configData: {
                            "background": "#ffffff",
                            "fontFamily": "monospace",
                            "border": "1px solid #ccc",
                            "color": "#000000",
                            "fontSize": "16px"
                        }
                    });
                }
                return res.status(500).json({ error: 'Failed to read config file' });
            }

            console.log("Data from config file:\n", configData);

            let parsedConfig;
            try {
                parsedConfig = JSON.parse(configData);
            } catch (e) {
                console.error('Invalid config JSON:', e);
                return res.json({
                    value: data,
                    lines: value.length,
                    configData: {
                        "background": "#ffffff",
                        "fontFamily": "monospace",
                        "border": "1px solid #ccc",
                        "color": "#000000",
                        "fontSize": "16px"
                    },
                    warning: "Invalid config.json, loading defaults."
                });
            }

            res.json({
                value: data,
                lines: value.length,
                configData: parsedConfig
            });
        });
    });
});

app.post('/saveFileData', function (req, res) {
    const { root, value } = req.body;

    const fullFilePath = path.join(__dirname, root);

    const fullFilePathNormalized = fullFilePath.replace(/\\/g, '/');
    const userRootNormalized = path.join(__dirname, req.userRoot).replace(/\\/g, '/');


    if (!fullFilePathNormalized.startsWith(userRootNormalized)) {
        console.warn(`User ${req.cookies.userLogin} attempted to save file outside their root: ${fullFilePath}`);
        return res.status(403).json({ error: 'Access Denied: Cannot save files outside your designated folder.' });
    }

    const userConfigPathNormalized = path.join(__dirname, mainRoot, req.cookies.userLogin, 'Configuration', 'config.json').replace(/\\/g, '/');
    if (fullFilePathNormalized === userConfigPathNormalized) {
        console.warn(`User ${req.cookies.userLogin} attempted to save config.json via /saveFileData.`);
        return res.status(403).json({ error: 'Access Denied: Save config via settings.' });
    }

    console.log(root)
    console.log(value)

    if (!root || typeof value !== 'string') {
        return res.status(400).json({ error: 'Invalid input' });
    }

    fs.writeFile(fullFilePath, value, 'utf8', (err) => {
        if (err) {
            console.error('File write error:', err);
            return res.status(500).json({ error: 'Failed to write file' });
        }

        console.log(`File saved: ${fullFilePath}`);
        res.json({ success: true });
    });
});

app.post('/saveConfig', function (req, res) {
    const { background, fontFamily, border, fontSize, color } = req.body

    console.log(background)
    console.log(fontFamily)
    console.log(border)
    console.log(fontSize)
    console.log(color)

    if (!background || !fontFamily || !border || !fontSize || !color) {
        return res.status(400).json({ error: 'Invalid input' });
    }

    const configData = JSON.stringify({
        "background": background,
        "fontFamily": fontFamily,
        "border": border,
        "color": color,
        "fontSize": fontSize
    }, null, 2);

    const userLogin = req.cookies.userLogin;
    if (!userLogin) {
        return res.status(401).json({ error: 'Unauthorized: No user logged in.' });
    }
    const configRoot = path.join(__dirname, mainRoot, userLogin, "Configuration", "config.json");

    fs.writeFile(configRoot, configData, 'utf8', (err) => {
        if (err) {
            console.error('File write error:', err);
            return res.status(500).json({ error: 'Failed to write config file' });
        }

        console.log(`Config saved: ${configRoot}`);
        res.json({ success: true });
    })
})

app.get("/register", function (req, res) {
    res.render("register.hbs")
})

app.get("/login", function (req, res) {
    res.render("login.hbs");
})

app.post("/registerUser", async function (req, res) {
    const { login, password, repeatPassword } = req.body;

    if (password !== repeatPassword || !login || !password) {
        return res.render('error.hbs', { message: "Hasła nie pasują lub brakuje danych." });
    }

    try {
        const users = await readUsers();

        const exists = users.some(user => user.login === login);

        if (exists) {
            return res.render('error.hbs', { message: "Login jest już zajęty." });
        }

        const hashedPassword = await hash(password, 10);

        const userFolder = path.join(__dirname, mainRoot, login);
        const userFilesFolder = path.join(userFolder, 'Files');
        const userConfigFolder = path.join(userFolder, 'Configuration');
        const userConfigFile = path.join(userConfigFolder, 'config.json');

        try {
            await fs.promises.mkdir(userFilesFolder, { recursive: true });
            await fs.promises.mkdir(userConfigFolder, { recursive: true });

            const defaultConfigContent = JSON.stringify({
                "background": "#ffffff",
                "fontFamily": "monospace",
                "border": "1px solid #ccc",
                "color": "#000000",
                "fontSize": "16px"
            }, null, 2);
            await fs.promises.writeFile(userConfigFile, defaultConfigContent, 'utf8');

            console.log(`User folders and config created for: ${login}`);
        } catch (dirErr) {
            console.error('Error creating user directories or config file:', dirErr);
        }

        users.push({ login, password: hashedPassword });
        await writeUsers(users);

        return res.render('login.hbs', { message: "Rejestracja zakończona sukcesem. Możesz się zalogować." });
    } catch (err) {
        console.error("Błąd rejestracji:", err);
        return res.render('error.hbs', { message: "Wystąpił błąd przy rejestracji." });
    }
});


app.post("/loginUser", async function (req, res) {
    const { login, password } = req.body;

    try {
        const users = await readUsers();
        const user = users.find(u => u.login === login);

        if (!user) {
            return res.render('error.hbs', { message: "Nieprawidłowy login lub hasło." });
        }

        const passwordMatch = await compare(password, user.password);

        if (passwordMatch) {
            res.cookie("userLogin", login, { httpOnly: true, maxAge: 3600 * 1000 });
            return res.redirect('/');
        } else {
            return res.render('error.hbs', { message: "Nieprawidłowy login lub hasło." });
        }
    } catch (err) {
        console.error("Błąd logowania:", err);
        return res.render('error.hbs', { message: "Wystąpił błąd podczas logowania." });
    }
});

app.get("/logout", function (req, res) {
    res.clearCookie("userLogin");
    res.redirect("/login");
});


app.get("*", function (req, res) {
    const context = {
        page: req.originalUrl,
        loggedInUser: req.cookies.userLogin
    };
    console.log('Requested URL:', req.originalUrl);
    res.status(404).render('404.hbs', context);
});

// Listening
app.listen(PORT, function () {
    console.log("Serwer aktywowany na porcie: " + PORT);
})