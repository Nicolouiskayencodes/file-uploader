const router = require('express').Router();
const controller = require('../controllers/controller.js')
const multer  = require('multer')
const storage = multer.memoryStorage({
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

router.get('/upload/:id', controller.uploadForm)
router.post('/upload/:id', upload.single('uploaded_file'), controller.uploadConfirm)

router.post('/addFolder/:id', controller.addFile)

router.get('/folder/:id', controller.openFolder)

router.post('/deleteFolder/:id', controller.deleteFolder)
router.post('/renameFolder/:id', controller.renameFolder)

router.get('/file/:id', controller.getFile)

router.post('/deleteFile/:id', controller.deleteFile)

module.exports = router;