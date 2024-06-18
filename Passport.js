const passport = require('passport'),
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
=======
<<<<<<< HEAD

const passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    Models = require('./models1.js'),
    passportJWT = require('passport-jwt');

const index = require('./index4.js');

let Users = Models.User,
    JWTStrategy = passportJWT.Strategy,
    ExtractJWT = passportJWT.ExtractJwt;

passport.use(
    new LocalStrategy(
        {
            usernameField: 'Username',
            passwordField:  'Password',
        },
        async (username, password, callback) => {
            console.log(`${username} ${password}`);
            await Users.findOne({ Username: username})
            .then((user) => {
                if(!user) {
                    console.log('incorrect username');
                    return callback(null, false, {
                        message: 'Incorrect usernam or password.',
                    });
                }
                console.log('finished');
                return callback(null, user);
            })
            .catch((error) => {
                if (error) {
                    console.log(error);
                    return callback(error);
                }
            })
        }
    )
); 



passport.use(new JWTStrategy({
    jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
    secretOrKey: 'your_jwt_secret'
}, async (JWTPayload, callback) => {
    return await Users.findById(JWTPayload._id)
    then((user) => {
        return callback(null, user);
    })
    .catch((error) => {
        return callback(error)
    });
=======

const passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    Models = require('./models1.js'),
    passportJWT = require('passport-jwt');

const index = require('./index4.js');

let Users = Models.User,
    JWTStrategy = passportJWT.Strategy,
    ExtractJWT = passportJWT.ExtractJwt;

passport.use(
    new LocalStrategy(
        {
            usernameField: 'Username',
            passwordField:  'Password',
        },
        async (username, password, callback) => {
            console.log(`${username} ${password}`);
            await Users.findOne({ Username: username})
            .then((user) => {
                if(!user) {
                    console.log('incorrect username');
                    return callback(null, false, {
                        message: 'Incorrect usernam or password.',
                    });
                }
                console.log('finished');
                return callback(null, user);
            })
            .catch((error) => {
                if (error) {
                    console.log(error);
                    return callback(error);
                }
            })
        }
    )
); 



passport.use(new JWTStrategy({
    jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
    secretOrKey: 'your_jwt_secret'
}, async (JWTPayload, callback) => {
    return await Users.findById(JWTPayload._id)
    then((user) => {
        return callback(null, user);
    })
    .catch((error) => {
        return callback(error)
    });
>>>>>>> 19db2fe6cd7f877353ca7927001c0820786a2e4e
>>>>>>> origin/main
}));