const {
    google
} = require('googleapis')
const fs = require('fs')
const path = require('path')

// Carga el archivo JSON de credenciales descargado desde Google Cloud Console
const apikey = require('./apikeys.json')

// Autentica el cliente usando las credenciales
const auth = new google.auth.GoogleAuth({
    credentials: apikey,
    scopes: ['https://www.googleapis.com/auth/drive']
})

// Crea un cliente de la API de Google Drive
const drive = google.drive({
    version: 'v3',
    auth
})

// ============================ Listar archivos ============================
/**
 * Function to list contents of the folder
 * @param {*} folderId ID of drive folder
 */
async function listFilesInFolder(folderId) {
    try {
        const response = await drive.files.list({
            q: `'${folderId}' in parents`,
            fields: 'files(id, name, mimeType)',
        })

        const files = response.data.files
        console.log('Archivos en la carpeta:')
        files.forEach(file => {
            console.log(`(${file.id}) ${file.name} (${file.mimeType})`)
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
async function uploadFiles(folderId, fileName, filePath, mimeType) {
    try {
        const archivoMetadata = {
            name: fileName,
            mimeType: mimeType,
            parents: [folderId]
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
 * Delete file
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
 * Verifies if file exists
 * @param {*} fileName name of file
 * @param {*} folderId ID of drive folder
 * @returns 
 */
async function verifyExistence(fileName, folderId) {
    try {
        const response = await drive.files.list({
            q: `'${folderId}' in parents`,
            fields: 'files(id, name)',
        })

        const files = response.data.files
        //console.log(archivos)
        const existe = files.some(el => el.name === fileName)
        if (existe)
            return files.find(el => el.name === fileName).id
        else
            return ""

    } catch (error) {
        console.error('Error al listar archivos:', error)
    }
}

// ============================ Subir archivo sobreescribir ============================
/**
 * if a file exists in the destination folder te file is deleted and a new file is uploaded
 * @param {*} folderId ID of drive folder
 * @param {*} fileName name of file
 * @param {*} filePath file of path to upload
 * @param {*} mimeType type of file
 */
async function uploadAndReplace(folderId, fileName, filePath, mimeType) {
    let archivoID = await verifyExistence(fileName, folderId)
    if (archivoID != '') {
        await deleteFile(archivoID)
        uploadFiles(folderId, fileName, filePath, mimeType)
    } else
        uploadFiles(folderId, fileName, filePath, mimeType)
}

// ============================ Bajar archivos ============================
/**
 * Download a file and save it with name = fileName
 * @param {*} fileId Id of file to download
 * @param {*} fileName name to save the file as
 */
function downloadFile(fileId, fileName, i) {
    //const destFilePath = path.join(__dirname, 'downloads', fileName)
    const destFilePath = path.join(__dirname, i + '', fileName)

    const download = async () => {
        try {
            const response = await drive.files.get({
                fileId,
                alt: 'media'
            }, {
                responseType: 'stream'
            })
            const dest = fs.createWriteStream(destFilePath)
            response.data
                .on('end', () => console.log('Archivo descargado correctamente.'))
                .on('error', err => console.error('Error al descargar el archivo ' + fileName+ ' a la carpeta ' + destFilePath + ':', err))
                .pipe(dest)
        } catch (error) {
            console.error('Error al descargar el archivo:', error)
        }
    }

    download()
}
// ============================ Storage check ============================
/**
 * Get current and max storage
 */
async function getDriveStorage() {
    try {
        const about = await drive.about.get({
            fields: 'storageQuota',
        })

        const storageQuota = about.data.storageQuota
        console.log('Espacio total:', formatBytes(storageQuota.limit))
        console.log('Espacio utilizado:', formatBytes(storageQuota.usage))
        console.log('Espacio disponible:', formatBytes(storageQuota.limit - storageQuota.usage))
    } catch (error) {
        console.error('Error al obtener información de almacenamiento:', error)
    }
}
/**
 * Converts bytes up to Tera bytes
 * @param {*} bytes 
 * @returns 
 */
function formatBytes(bytes) {
    const units = ['B', 'KB', 'MB', 'GB', 'TB']
    let index = 0
    while (bytes >= 1024 && index < units.length - 1) {
        bytes /= 1024
        index++
    }
    return `${bytes.toFixed(2)} ${units[index]}`
}

module.exports = {
    listFilesInFolder,
    uploadFiles,
    deleteFile,
    verifyExistence,
    uploadAndReplace,
    downloadFile,
    getDriveStorage,
    formatBytes
}