const passport = require('passport');
const prisma = require('../db/prisma.js')
const bcrypt = require('bcryptjs');
const supabase = require('../config/supabase.js')
const Crypto = require('crypto');
const {decode} = require('base64-arraybuffer')

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
  res.render('upload', {id: req.params.id})
}

const uploadConfirm = async (req, res, next) => {
  const ext = req.file.originalname.split('.').pop()
  const filename = Crypto.randomUUID() + '.'+ ext
  try {
    const file = req.file;
    if (!file) {
      res.status(400).json({ message: "Please upload a file"});
      return
    }
    const fileBase64 = decode(file.buffer.toString('base64'))

    const {data, error} = await supabase.storage
    .from('file-uploader')
    .upload(`public/${filename}`, fileBase64, {
      contentType: file.mimetype
    });
    if (error) {
      return next(error)
    }
    
  } catch (error) {
    return next(error)
  }
    const {data} = supabase.storage
    .from('file-uploader')
    .getPublicUrl(`public/${filename}`, {
      download: true
    });


  await prisma.file.create({
        data: {
          name: req.body.file_name,
          storedName: filename,
          filepath: data.publicUrl,
          size: req.file.size,
          folderId: parseInt(req.params.id),
        }
      })
  res.redirect(`/folder/${req.params.id}`)
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
  var shareUrl = req.protocol + '://' + req.get('host') + '/share/' + folder.shareId
  res.render('folder', {folder: folder, shareUrl: shareUrl})
}
const deleteFolder = async(req,res) => {
  const folder = await prisma.folder.findUnique({
    where: {
      id: parseInt(req.params.id),
    }
  })
  if (!folder.isMain){
    await prisma.folder.delete({
      where: {
        id: parseInt(req.params.id)
      }
    })
  }
  res.redirect(`/folder/${folder.parentId}`)
}
const renameFolder = async (req, res) => {
  await prisma.folder.update({
    where: {
      id : parseInt(req.params.id),
    },
    data: {
      name: req.body.newName,
    },
  })
  res.redirect(`/folder/${req.params.id}`)
}

const getFile = async (req, res) => {
  let file = await prisma.file.findUnique({
    where: {
      id: parseInt(req.params.id)
    },
    include:{
      folder: true
    }
  })
  res.render('file', {file: file})
}

const deleteFile = async (req, res) => {
  const file = await prisma.file.findUnique({
    where: {
      id: parseInt(req.params.id)
    }
  })
  await prisma.file.delete({
    where: {
      id: parseInt(req.params.id)
    }
  })
  const {data, error} = await supabase.storage
  .from('file-uploader')
  .remove([`public/${file.storedName}`])

  res.redirect(`/folder/${file.folderId}`)
}

const shareFolder = async (req, res, next) => {
  const cryptoShare = Crypto.randomUUID()
  try{
  await prisma.folder.update({
    where: {
      id: parseInt(req.params.id),
    },
    data: {
      shareId: cryptoShare,
      expiration: new Date(req.body.expiration)
    }
  })
  } catch (err) {
    return next(err)
  }
  res.redirect(`/folder/${req.params.id}`)
}

const viewShare = async (req, res) => {
  const sharedFolder = await prisma.folder.findUnique({
    where: {
      shareId: req.params.shareId,
    },
    include: {
      files: true,
      owner: {
        select: {
          username: true
        }
      }
    }
  })
  console.log(sharedFolder)
  var shareUrl = req.protocol + '://' + req.get('host') + '/share/' + sharedFolder.shareId
  res.render('shared', {folder: sharedFolder, shareUrl: shareUrl})
}

const fileShare = async (req, res) => {
  const sharedFile = await prisma.file.findUnique({
    where: {
      id: parseInt(req.params.fileId)
    },
    include:{
      folder: true
    }
  })
  res.render('fileshare', {file: sharedFile, shareId: req.params.shareId})
}

module.exports = {login, register, index, loginForm, registerForm, logout, redirectIndex, loginFailure, uploadForm, uploadConfirm, addFile, openFolder, deleteFolder, renameFolder, getFile, deleteFile, shareFolder, viewShare, fileShare}