const express = require('express');
const authenticate = require('../authenticate');
const multer = require('multer');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images');  // callback runs if no error; determines where to save file
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);    // client and server side file name is same
    }
});

const imageFileFilter = (req, file, cb) => {
    if(!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) { // if file type is not jpg, jpeg, png or gif
        return cb(new Error('You can upload only image files!'), false);
    }
    cb(null, true); // no error and multer will accept the file
};

const upload = multer({ storage: storage, fileFilter: imageFileFilter});

const uploadRouter = express.Router();

uploadRouter.route('/')
.get(authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
    res.statusCode = 403;
    res.end('GET operation not supported on /imageUpload');
})
.post(authenticate.verifyUser, authenticate.verifyAdmin, upload.single('imageFile'), (req, res) => {
    // upload.single is expecting a single upload with an input field name 'imageFile'

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');

    // multer adds a file object to the req
    res.json(req.file); // confirms to client that file is received correctly
})
.put(authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /imageUpload');
})
.delete(authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
    res.statusCode = 403;
    res.end('DELETE operation not supported on /imageUpload');
})

module.exports = uploadRouter;