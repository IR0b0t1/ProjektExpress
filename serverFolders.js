const fs = require("fs")
const path = require("path")

// Working with folders 101

// Don't do this like that (program creates a folder, but doesn't have enough time to delete it and vice versa)

// if (!fs.existsSync("./newdir")) {
//     fs.mkdir("./newdir", (err) => {
//         if (err) throw err
//         console.log("jest");
//     })
// }

// if (fs.existsSync("./newdir")) {
//     fs.rmdir("./newdir", (err) => {
//         if (err) throw err
//         console.log("nie ma ");
//     })
// }

// This works (good order)

// if (!fs.existsSync("./newdir")) {
//     fs.mkdir("./newdir", (err) => {
//         if (err) throw err
//         console.log("jest");

//         if (fs.existsSync("./newdir")) {
//             fs.rmdir("./newdir", (err) => {
//                 if (err) throw err
//                 console.log("nie ma ");
//             })
//         }
//     })
// }

// Getting a file list

// fs.readdir(__dirname, (err, files) => {
//     if (err) throw err
//     console.log("lista", files);
// })

// Creating a list and adding a nev folder

// fs.readdir(__dirname, (err, files) => {
//     // First list
//     if (err) throw err
//     console.log("lista 1 - ", files);

//     // Adding new folder
//     fs.mkdir("./newdir", (err) => {
//         if (err) throw err
//         console.log("dodany");

//         // Second list
//         fs.readdir(__dirname, (err, files) => {
//             if (err) throw err
//             console.log("lista 2 - ", files);
//         })
//     })
// })

// Am I a file of a folder?

// fs.readdir(__dirname, (err, files) => {
//     if (err) throw err

//     files.forEach((file) => {
//         fs.lstat(file, (err, stats) => {
//             if (err) throw err
//             console.log(file, stats.isDirectory());
//         })
//     })
// })

// Synchronised functions

try {
    fs.mkdirSync("./upload/test")
}
catch (err) {
    console.log("error", err.message);
}