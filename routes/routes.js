const router = require('express').Router();
const controller = require('../controllers/controller.js')

router.post('/login', controller.login);

router.post('/register', controller.register);

router.get('/', controller.index);

router.get('/login', controller.loginForm);

router.get('/register', controller.registerForm);

router.get('/logout', controller.logout);

router.get('/login-success', controller.redirectIndex);

router.get('/login-failure', controller.loginFailure);

module.exports = router;