const driveCall = require('./driveCall')
const mime = require('mime')
require('dotenv').config()

// Ruta del archivo que deseas subir
const filePath = 'app.js'
// Nombre del archivo que se guardará en Google Drive
const fileName = 'app.js'
// Tipo MIME del archivo
const mimeType = mime.getType(fileName)
// ID carpeta
const folderId = process.env.GD_FOLDER