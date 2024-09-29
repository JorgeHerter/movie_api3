/*const passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    Models = require('./models.js'),
    passportJWT = require('passport-jwt');


let Users = Models.User,
    JWTStrategy = passportJWT.Strategy,
    ExtractJWT = passportJWT.ExtractJwt;

    passport.use(new LocalStrategy(
        {
          usernameField: 'Username',
          passwordField: 'Password',
        },
        async (username, password, callback) => {
          console.log(`${username} ${password}`);
          await Users.findOne({ username: username })
            .then((user) => {
                console.log(user);
              if (!user) {
                console.log('incorrect username');
                return callback(null, false, { message: 'Incorrect username or password.' });
              }
      
              // Check if the password is correct
              let validatePassword = user.validatePassword(password);
              if (!user.validatePassword(password)) {
                console.log('incorrect password');
                return callback(null, false, { message: 'Incorrect username or password.' });
              }
      
              console.log('finished');
              return callback(null, user);
            })
            .catch((error) => {
              console.log(error);
              return callback(error);
            });
        }
      ));

passport.use(new JWTStrategy({
    jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
    secretOrKey: 'a1b2c3d4e5f6'
}, async (JWTPayload, callback) => {
    return await Users.findById(JWTPayload._id)
    .then((user) => {
        return callback(null, user);
    })
    .catch((error) => {
        return callback(error)
    });
}));*/
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const Models = require('./models.js');
const passportJWT = require('passport-jwt');
const bcrypt = require('bcrypt');

const Users = Models.User;
const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;

passport.use(
  new LocalStrategy(
    {
      usernameField: 'Username',
      passwordField: 'Password',
    },
    async (username, password, callback) => {
      try {
        const user = await Users.findOne({ Username: username });
        if (!user) {
          return callback(null, false, { message: 'Incorrect username or password.' });
        }

        const match = await bcrypt.compare(password, user.Password);
        if (!match) {
          return callback(null, false, { message: 'Incorrect username or password.' });
        }

        return callback(null, user);
      } catch (error) {
        console.error(error);
        return callback(error);
      }
    }
  )
);

passport.use(new JWTStrategy({
  jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET || 'default_jwt_secret'
}, async (jwtPayload, callback) => {
  try {
    const user = await Users.findById(jwtPayload._id);
    return callback(null, user);
  } catch (error) {
    return callback(error);
  }
}));


