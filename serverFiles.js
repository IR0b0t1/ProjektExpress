const fs = require("fs")
const path = require("path")

// fs.readFile from files/file01.txt without encoding

// fs.readFile("./files/file01.txt", (err, data) => {
//     if (err) throw err
//     console.log(data.toString());
// })

// fs.readFile from files/file01.txt with utf-8 enconding

// fs.readFile("./files/file01.txt", "utf-8", (err, data) => {
//     if (err) throw err
//     console.log(data.toString());
// })

// A bad way of creating a path to a file
// const filepath = __dirname + "/files" + "file01.txt"

// A good way of creating a path to a file
const filepath = path.join(__dirname, "files", "file01.txt")

// Overwriting a file and saving overwritten file

const filepath2 = path.join(__dirname, "files", "file02.txt")

// fs.writeFile([filepath], [data_for_overwriting], (err) => {})

// fs.writeFile(filepath2, "tekst do wpisania", (err) => {
//     if (err) throw err
//     console.log("plik nadpisany");
// })

// Adding additional text to a file
// fs.appendFile(filepath2, "\n\ntekst do dopisania", (err) => {
//     if (err) throw err
//     console.log("plik utworzony");
// })

// Deleting a file with time of deletion

// fs.unlink(filepath, (err) => {
//     if (err) throw err
//     console.log("czas 1: " + new Date().getMilliseconds());
// })

// Checking file existence

// if (fs.existsSync(filepath)) {
//     console.log("plik istnieje");
// } else {
//     console.log("plik nie istnieje");
// }

// Checking file existence with multiple files

// const filetab = [filepath, filepath2]

// for (let i = 0; i < filetab.length; i++) {
//     if (fs.existsSync(filetab[i])) {
//         console.log("plik istnieje");
//     } else {
//         console.log("plik nie istnieje");
//     }
// }

// Callbacks

const filepath3 = path.join(__dirname, "files", "file03.txt")
const filepath4 = path.join(__dirname, "files", "file04.txt")

fs.writeFile(filepath3, "tekst do zapisania", (err) => {
    if (err) throw err
    console.log("plik utworzony - czas 1: " + new Date().getMilliseconds());

    fs.appendFile(filepath3, "\n\ntekst do dopisania", (err) => {
        if (err) throw err
        console.log("plik zmodyfikowany - czas 2: " + new Date().getMilliseconds());

        fs.appendFile(filepath3, "\n\nkolejny tekst", (err) => {
            if (err) throw err
            console.log("plik zmodyfikowany - czas 3: " + new Date().getMilliseconds());

            fs.appendFile(filepath3, `\n\nplik zmodyfikowany - czas 4: ${new Date().getMilliseconds()}`, (err) => {
                if (err) throw err
                console.log("plik zmodyfikowany - czas 4: " + new Date().getMilliseconds());

            })
        })

    })
})

