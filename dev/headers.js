const fsPromises = require('fs').promises


const sourceFiles = {
    "app.js"
}

const header = "/*********** hello **********/"


let updateHeaderPromise = async function(file){
    return fsPromises.open(file, 'r')
}

let processFiles = async function(fileHandles){
    
}

let updateActionsPromises = sourceFiles.map(updateHeaderPromise)

Promise.all(updateActionsPromises)
.then(processFiles)
.then(_ => console.log('Headers updated'))





