import multer from 'multer';
import path from 'path';
import fs from 'fs';

/**
 * Reusable function to generate a unique filename.
 * It correctly places the timestamp before the file extension.
 * e.g., 'my-image.png' becomes 'my-image-1678886400000.png'
 */
const generateUniqueFilename = (req, file, cb) => {
    const ext = path.extname(file.originalname); // .png
    const basename = path.basename(file.originalname, ext); // my-image
    
    // Clean up the base name to be URL-friendly
    const sanitizedBasename = basename.replace(/\s+/g, '-').toLowerCase();

    const finalName = `${sanitizedBasename}-${Date.now()}${ext}`;
    cb(null, finalName);
};

/**
 * A factory function to create a storage configuration for a specific destination.
 * @param {string} destinationFolder - The subfolder within 'public' (e.g., 'case_study_images').
 * @returns {multer.StorageEngine} A Multer storage engine instance.
 */
const createStorage = (destinationFolder) => {
    return multer.diskStorage({
        destination: function (req, file, cb) {
            const dir = path.join('public', destinationFolder);
            // Ensure the directory exists, creating it if necessary.
            fs.mkdirSync(dir, { recursive: true });
            cb(null, dir);
        },
        filename: generateUniqueFilename
    });
};

// --- Create and Export Specific Uploaders ---

// Uploader for Case Study images
export const uploadCaseStudy = multer({
    storage: createStorage('case_study_images')
});

// Uploader for Employee images
export const uploadEmployee = multer({
    storage: createStorage('employee_images')
});

// Uploader for general Work/Project images
export const uploadWork = multer({
    storage: createStorage('work_images')
});
export const uploadService = multer({
    storage: createStorage('service_images')
});
export const uploadAbout = multer({
    storage: createStorage('about_images')
});

// For backwards compatibility, you can export a default uploader.
// We'll point it to the 'work_images' uploader.
export const upload = uploadWork;
