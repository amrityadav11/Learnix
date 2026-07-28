const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadToCloudinary = async (filePath, folder = 'course-marketplace', options = {}) => {
    try {
        const result = await cloudinary.uploader.upload(filePath, {
            folder,
            resource_type: 'auto',
            ...options,
        });
        return { url: result.secure_url, publicId: result.public_id };
    } catch (error) {
        throw new Error(`Cloudinary upload failed: ${error.message}`);
    }
};

const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
    try {
        await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    } catch (error) {
        console.error(`Failed to delete from Cloudinary: ${error.message}`);
    }
};

const uploadVideoToCloudinary = async (filePath, folder = 'course-marketplace/videos') => {
    return uploadToCloudinary(filePath, folder, {
        resource_type: 'video',
        chunk_size: 6000000,
        eager: [{ streaming_profile: 'full_hd', format: 'm3u8' }],
        eager_async: true,
    });
};

module.exports = { cloudinary, uploadToCloudinary, deleteFromCloudinary, uploadVideoToCloudinary };
