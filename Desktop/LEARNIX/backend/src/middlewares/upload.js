const multer = require('multer');
const path = require('path');
const ErrorResponse = require('../utils/errorResponse');

// Memory storage for Cloudinary uploads
const storage = multer.memoryStorage();

// Disk storage for temporary files
const diskStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
    },
});

const imageFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new ErrorResponse('Only image files (JPEG, PNG, WebP, GIF) are allowed.', 400), false);
    }
};

const videoFilter = (req, file, cb) => {
    const allowedTypes = ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/x-msvideo', 'video/webm'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new ErrorResponse('Only video files (MP4, MOV, AVI, WebM) are allowed.', 400), false);
    }
};

const pdfFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new ErrorResponse('Only PDF files are allowed.', 400), false);
    }
};

const anyFileFilter = (req, file, cb) => {
    const blockedTypes = ['application/x-msdownload', 'application/x-executable'];
    if (blockedTypes.includes(file.mimetype)) {
        cb(new ErrorResponse('File type not allowed.', 400), false);
    } else {
        cb(null, true);
    }
};

// Upload handlers
exports.uploadImage = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: imageFilter,
}).single('image');

exports.uploadAvatar = multer({
    storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
    fileFilter: imageFilter,
}).single('avatar');

exports.uploadThumbnail = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: imageFilter,
}).single('thumbnail');

exports.uploadVideo = multer({
    storage: diskStorage,
    limits: { fileSize: 2 * 1024 * 1024 * 1024 }, // 2GB
    fileFilter: videoFilter,
}).single('video');

exports.uploadPDF = multer({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
    fileFilter: pdfFilter,
}).single('pdf');

exports.uploadAssignment = multer({
    storage,
    limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
    fileFilter: anyFileFilter,
}).single('file');

exports.uploadCourseFiles = multer({
    storage,
    limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
    fileFilter: anyFileFilter,
}).fields([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'previewVideo', maxCount: 1 },
]);
