const driveCall = require('./driveCall')
const mime = require('mime')
const os = require('os');
require('dotenv').config()
// ID carpeta
const folderId = process.env.GD_FOLDER


/**
 * Test enviroment
 */

//const fileName = 'Test_Image.png'

//for(let i = 0; i < 100; i++)
//    driveCall.uploadFiles(folderId,fileName,'C:/Users/gonza/Downloads/Test_Image.png',mime.getType(fileName))



// Espacio libre en bytes
const freeMemory = os.freemem();

console.log('Espacio libre en el sistema:', driveCall.formatBytes(freeMemory));
  