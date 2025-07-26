import multer from 'multer'
import path from 'path';
import fs from 'fs';

const storage = multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,'public/team_images');
    },
    filename:function(req,file,cb){
        const suffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null,suffix + '-' + file.originalname);
    }
})

export const upload = multer({storage});