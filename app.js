const driveCall = require('./driveCall')
const mime = require('mime')
require('dotenv').config()

// Ruta del archivo que deseas subir
const filePath = 'C:/Users/gonza/Downloads/3d834029-d654-4808-9159-e1e75c20ad85.jpg'
// Nombre del archivo que se guardará en Google Drive
const fileName = 'img2.jpg'
// Tipo MIME del archivo
const mimeType = mime.getType(fileName)
// ID carpeta
const folderId = process.env.GD_FOLDER

const fileId = '1NkvFPMk5cyY0-OFvNqT4OoVCz7Z4jOBs'