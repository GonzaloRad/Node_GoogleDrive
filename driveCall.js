const { google } = require('googleapis')
const fs = require('fs')

// Carga el archivo JSON de credenciales descargado desde Google Cloud Console
const apikey = require('./apikeys.json')

// Autentica el cliente usando las credenciales
const auth = new google.auth.GoogleAuth({
    credentials: apikey,
    scopes: ['https://www.googleapis.com/auth/drive']
})

// Crea un cliente de la API de Google Drive
const drive = google.drive({ version: 'v3', auth })


// ============================ Listar archivos ============================
/**
 * 
 * @param {*} folderId ID of drive folder
 */
async function listFilesInFolder(folderId) {
    try {
        const response = await drive.files.list({
            q: `'${folderId}' in parents`,
            fields: 'files(id, name)',
        })

        const files = response.data.files
        console.log('Archivos en la carpeta:')
        files.forEach(file => {
            console.log(`${file.name} (${file.id})`)
        })
    } catch (error) {
        console.error('Error al listar archivos:', error)
    }
}

// ============================ Subir archivo ============================
/**
 * Upload file
 * @param {*} fileName name of file to upload
 * @param {*} filePath file of path to upload
 * @param {*} mimeType type of file
 */
async function uploadFiles(folderId,fileName, filePath, mimeType) {
    try {
        const archivoMetadata = {
            name: fileName,
            mimeType: mimeType,
            parents:[folderId]
        }

        const media = {
            mimeType: mimeType,
            body: fs.createReadStream(filePath)
        }

        const response = await drive.files.create({
            requestBody: archivoMetadata,
            media: media,
            fields: 'id'
        })

        console.log('Archivo subido con ID:', response.data.id)
    } catch (error) {
        console.error('Error al subir archivo:', error.message)
    }
}

// ============================ Borrar archivo ============================
/**
 * 
 * @param {*} idFile ID of file in drive
 */
async function deleteFile(idFile) {
    try {
        const response = await drive.files.delete({
            fileId: idFile
        })
        console.log('Archivo borrado exitosamente.')
    } catch (error) {
        console.error('Error al borrar el archivo:', error.message)
    }
}

// ============================ Verificar archivo duplicado ============================
/**
 * 
 * @param {*} fileName name of file
 * @param {*} folderId ID of drive folder
 * @returns 
 */
async function verifyExistence(fileName,folderId) {
    try {
        const response = await drive.files.list({
            q: `'${folderId}' in parents`,
            fields: 'files(id, name)',
        })

        const files = response.data.files
        //console.log(archivos)
        const existe = files.some(el => el.name === fileName)
        if(existe)
            return files.find(el => el.name === fileName).id
        else
            return ""

    } catch (error) {
        console.error('Error al listar archivos:', error)
    }
}

// ============================ Subir archivo sobreescribir ============================
/**
 * 
 * @param {*} folderId ID of drive folder
 * @param {*} fileName name of file
 * @param {*} filePath file of path to upload
 * @param {*} mimeType type of file
 */
async function uploadAndReplace(folderId,fileName, filePath, mimeType) {
    let archivoID = await verifyExistence(fileName,folderId)
    if(archivoID != '')
    {
        await deleteFile(archivoID)
        uploadFiles(folderId,fileName, filePath, mimeType)
    }
    else
        uploadFiles(folderId,fileName, filePath, mimeType)
}

module.exports = {
    listFilesInFolder,
    uploadFiles,
    deleteFile,
    verifyExistence,
    uploadAndReplace
}