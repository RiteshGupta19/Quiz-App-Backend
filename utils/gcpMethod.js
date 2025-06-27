require('dotenv').config();

const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { Storage } = require('@google-cloud/storage');

const keyFilename = path.join(__dirname, '../services/ServiceAccountKey.json');
const storage = new Storage({ keyFilename });
const bucketName = process.env.GCP_BUCKET_NAME;
const bucket = storage.bucket(bucketName);


const deleteFromGCS = (filePath) => {
    return new Promise((resolve, reject) => {
        const fileInstance = bucket.file(filePath);
 
        fileInstance.delete((err) => {
            if (err) {
                // console.error('Error deleting file from GCS:', err);
                reject('Error deleting file');
            } else {
                resolve();
            }
        });
    });
};

 const uploadImageToGCS = (file, folderPath, userId) => {
  return new Promise((resolve, reject) => {
    const uniqueSuffix = uuidv4();
    const fileName = `${folderPath}${userId}/${uniqueSuffix}-${file.originalname}`;
    const fileRef = bucket.file(fileName);

    const blobStream = fileRef.createWriteStream({
      resumable: false,
      contentType: file.mimetype,
    });

    blobStream.on("error", (err) => {
      console.error("Blob Stream Error:", err);
      reject(err);
    });

    blobStream.on("finish", () => {
      const fileURL = `https://storage.googleapis.com/${bucketName}/${fileRef.name}`;
      resolve(fileURL);
    });

    blobStream.end(file.buffer);
  });
};


const getSignedUrl = async (filePath) => {
  const Path = filePath.replace(`https://storage.googleapis.com/${bucketName}/`, '');
  const file = bucket.file(Path);
  const signedUrlConfig = {
    version: 'v4',
    action: 'read',
    expires: Date.now() + 5 * 60 * 1000, 
    responseCacheControl: 'no-cache',
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
  };

  // ✅ Await the promise before destructuring
  const [url] = await file.getSignedUrl(signedUrlConfig);
  return url;
};


module.exports = {deleteFromGCS, getSignedUrl , uploadImageToGCS}