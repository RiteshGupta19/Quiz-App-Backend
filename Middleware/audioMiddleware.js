const multer = require('multer');
const path = require('path');

// Use memory storage to handle file as buffer
const storage = multer.memoryStorage();

const audioUpload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB max
  fileFilter: function (req, file, cb) {
    const fileTypes = /mp3|mpeg|wav|ogg|m4a/; 
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = fileTypes.test(file.mimetype);

    if (mimetype && extname) {
      cb(null, true);
    } else {
      cb('Unsupported audio format! Allowed: mp3, wav, ogg, m4a');
    }
  },
});

module.exports = audioUpload;
