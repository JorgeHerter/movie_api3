/*const passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    Models = require('./models.js'),
    passportJWT = require('passport-jwt');

let Users = Models.User,
    JWTStrategy = passportJWT.Strategy,
    ExtractJWT = passportJWT.ExtractJwt;
    passport.use(
      new LocalStrategy(
          {
              usernameField: 'username',  // Match your request body
              passwordField: 'password',  // Match your request body
          },
          async (username, password, callback) => {
              console.log(`Attempting to log in with username: ${username} and password: ${password}`);
              await User.findOne({ username })  // Make sure the field is correct here
                  .then((user) => {
                      if (!user) {
                          console.log('Incorrect username');
                          return callback(null, false, { message: 'Incorrect username or password.' });
                      }
                      if (!user.validatePassword(password)) {
                          console.log('Incorrect password');
                          return callback(null, false, { message: 'Incorrect password.' });
                      }
                      console.log('User authenticated successfully');
                      return callback(null, user);
                  })
                  .catch((error) => {
                      console.error('Error in user lookup:', error);
                      return callback(error);
                  });
          }
      )
  );
  
/*passport.use(
    new LocalStrategy(
        {
            usernameField: 'Username',
            passwordField: 'Password',
        },
        async (username, password, callback) => {
            console.log(`${username} ${password}`);
            await Users.findOne({ Username: username })
                .then((user) => {
                    if (!user) {
                        console.log('incorrect username');
                        return callback(null, false, {
                            message: 'Incorrect username or password.',
                        });
                    }
                    if (!user.validatePassword(password)) {
                        console.log('incorrect password');
                        return callback(null, false, {
                            message: 'incorrect password.',
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
                });
        }
    )
);*/

/*passport.use(
    new JWTStrategy(
        {
            jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
            secretOrKey: 'a1b2c3d4e5f6',
        },
        async (jwtPayload, callback) => {
            return await Users.findById(jwtPayload._id)
                .then((user) => {
                    return callback(null, user);
                })
                .catch((error) => {
                    return callback(error);
                });
        }
    )
);

module.exports = passport;*/
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const Models = require('./models.js');
const passportJWT = require('passport-jwt');

let Users = Models.User;
const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;

// Local Strategy for username/password authentication
passport.use(
    new LocalStrategy(
        {
            usernameField: 'username',  // Match your request body
            passwordField: 'password',  // Match your request body
        },
        async (username, password, done) => {
            console.log(`Attempting to log in with username: ${username}`);
            try {
                const user = await Users.findOne({ username });
                
                // Check if user exists
                if (!user) {
                    console.log('Incorrect username');
                    return done(null, false, { message: 'Incorrect username or password.' });
                }

                // Validate password
                if (!user.validatePassword(password)) {
                    console.log('Incorrect password');
                    return done(null, false, { message: 'Incorrect password.' });
                }

                console.log('User authenticated successfully');
                return done(null, user);
            } catch (error) {
                console.error('Error in user lookup:', error);
                return done(error);
            }
        }
    )
);

// JWT Strategy for token-based authentication
passport.use(
    new JWTStrategy(
        {
            jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
            secretOrKey: 'a1b2c3d4e5f6',  // Replace with a secure secret
        },
        async (jwtPayload, done) => {
            try {
                const user = await Users.findById(jwtPayload._id);
                return done(null, user);
            } catch (error) {
                return done(error);
            }
        }
    )
);

module.exports = passport;


