const router = require('express').Router();
const controller = require('../controllers/controller.js')
const crypto = require('crypto')
const multer  = require('multer')
const mime = require('mime')
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/')
  },
  filename: function (req, file, cb) {
    crypto.pseudoRandomBytes(16, function (err, raw) {
      cb(null, raw.toString('hex') + Date.now() + '.' + mime.extension(file.mimetype));
    });
  }
});
const upload = multer({ storage: storage })

router.post('/login', controller.login);

router.post('/register', controller.register);

router.get('/', controller.index);

router.get('/login', controller.loginForm);

router.get('/register', controller.registerForm);

router.get('/logout', controller.logout);

router.get('/login-success', controller.redirectIndex);

router.get('/login-failure', controller.loginFailure);

router.get('/upload', controller.uploadForm)
router.post('/upload', upload.single('uploaded_file'), controller.uploadConfirm)

router.post('/addFolder/:id', controller.addFile)

router.get('/folder/:id', controller.openFolder)

router.post('/deleteFolder/:id', controller.deleteFolder)
router.post('/renameFolder/:id', controller.renameFolder)

module.exports = router;