const passport = require('passport');
const prisma = require('../db/prisma.js')
const bcrypt = require('bcryptjs');

const login = passport.authenticate('local', {
  successRedirect: "/login-success",
  failureRedirect: "/login-failure"
});

const register = async (req, res, next) => {
  bcrypt.hash(req.body.password, 10, async (err, hashedPassword) => {
    if (err) {
      return next(err);
    }
    try {
      await prisma.users.create({ 
        data: {
          username: req.body.username,
          password: hashedPassword,
          folders: {
            create: {
              name: req.body.username,
              isMain: true
            }
          }
        }
      });
      res.redirect("/login");
    } catch(err) {
      return next(err);
    }
  })
}

const index = (req, res, next) => {
  res.render('index')
}

const loginForm = (req, res, next) => {
  res.render('login')
}

const registerForm = (req, res, next) => {
  res.render('register')
}

const logout = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect('/');
  }
  );
}

const redirectIndex = (req, res, next) => {
  res.redirect('/');
}

const loginFailure =  (req, res, next) => {
  res.render('login', {errors:[{msg:'Username or password did not match'}]})
}

const uploadForm = (req, res) => {
  res.render('upload')
}

const uploadConfirm = (req, res) => {
  console.log(req.file, req.body)
  res.redirect('/')
}

const addFile = async (req, res) => {
  const folderName = req.body.folderName;
  await prisma.folder.create({
    data: {
      name: folderName,
      parentId: parseInt(req.params.id),
      ownerId: res.locals.currentUser.id,
    }
  })
  res.redirect(`/folder/${req.params.id}`)
}

const openFolder = async (req, res) => {
  const folder = await prisma.folder.findUnique({
    where: {
      id: parseInt(req.params.id),
    },
    include: {
      parentFolder: true,
      subfolders: true,
      files: true,
    }
  })
  res.render('folder', {folder: folder})
}

module.exports = {login, register, index, loginForm, registerForm, logout, redirectIndex, loginFailure, uploadForm, uploadConfirm, addFile, openFolder}