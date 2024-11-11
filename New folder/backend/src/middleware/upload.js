const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists with absolute path
const uploadDir = path.join(__dirname, '../../uploads');
console.log('Upload directory:', uploadDir);

// Create uploads directory if it doesn't exist
if (!fs.existsSync(uploadDir)) {
    try {
        fs.mkdirSync(uploadDir, { recursive: true });
        console.log('Created uploads directory');
    } catch (error) {
        console.error('Error creating uploads directory:', error);
    }
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Log the destination path
        console.log('Saving file to:', uploadDir);
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Log the original filename
        console.log('Original filename:', file.originalname);
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const filename = uniqueSuffix + path.extname(file.originalname);
        console.log('Generated filename:', filename);
        cb(null, filename);
    }
});

const fileFilter = (req, file, cb) => {
    console.log('Received file:', {
        originalname: file.originalname,
        mimetype: file.mimetype
    });

    const allowedTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/webp',
        'application/octet-stream'
    ];

    if (allowedTypes.includes(file.mimetype)) {
        console.log('File type accepted:', file.mimetype);
        cb(null, true);
    } else {
        console.log('File type rejected:', file.mimetype);
        cb(new Error(`Invalid file type: ${file.mimetype}. Only JPEG, JPG, PNG and WebP are allowed.`), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});

module.exports = upload; 