/* eslint-disable no-console */
import multer from 'multer';

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/temp');
    },
    filename: function (req, file, cb) {
        console.log('fileOriginalName',file.originalname);
        cb(null, file.originalname);
    }
});

export const upload = multer({
    storage
});



/* eslint-disable no-console */
/* import multer from 'multer';
import path from 'path';

const upload = multer({
    dest: './public/temp',
    limits: { fileSize: 50 * 1024 * 1024 }, // 50 mb in size max limit
    storage: multer.diskStorage({
        destination: './public/temp',
        filename: (_req, file, cb) => {
            cb(null, file.originalname);
        }
    }),
    fileFilter: (_req, file, cb) => {
        const ext = path.extname(file.originalname);

        if (
            ext !== '.jpg' &&
            ext !== '.jpeg' &&
            ext !== '.webp' &&
            ext !== '.png' &&
            ext !== '.mp4'
        ) {
            cb(new Error(`Unsupported file type! ${ext}`), false);
            return;
        }

        cb(null, true);
    }
});

export default upload; */