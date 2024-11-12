const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs')
const prisma = require('../db/prisma.js')

passport.use(new LocalStrategy(
  async (username, password, done)=>{
    try {
      const user = await prisma.users.findUnique({
        where: {username: username},
        include: {
          mainFolder: {
          select:{name: true,
            id: true,
            subfolders: {select:{id: true,name: true,}},
            files: {select:{id: true, name: true,
              filepath: true,
            }}
          }
        }}
      })
    if (!user) {
      return done(null, false, {message: 'Incorrect username'});
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return done(null, false, { message: "Incorrect password" })
    }
    delete user.password;
    return done(null, user)
  } catch(err) {
    return done(err);
  }
}))

passport.serializeUser((user,done)=>{
  done(null, user.id);
})

passport.deserializeUser(async(id,done)=>{
  try {
    const user = await prisma.users.findUnique({
      where: {id: id},
      include: {
        mainFolder: {
          select:{name: true,
            id: true,
            subfolders: {select:{id: true,name: true,}},
            files: {select:{id: true, name: true,
              filepath: true,
            }}
          }
      }}
    })
    delete user.password;
    done(null, user);
  } catch (err) {
    done(err);
  }
})