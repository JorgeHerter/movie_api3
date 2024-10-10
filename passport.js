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


