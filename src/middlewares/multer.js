const multer = require('multer');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Determine the folder based on the file type
        const folder = req.body.folder || 'documents';
        cb(null, `uploads/${folder}`);
    },
    filename: (req, file, cb) => {
        // Use the original file name for the uploaded file
        cb(null, file.originalname);
    }
});

const upload = multer({ storage });

module.exports = upload;
