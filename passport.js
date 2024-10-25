const passport = require('passport'),
  LocalStrategy = require('passport-local').Strategy,
  Models = require('./models.js'),
  passportJWT = require('passport-jwt');

const bcryptjs = require('bcryptjs');
const JWT_SECRET= process.env.JWT_SECRET;
let Users = Models.User,
  JWTStrategy = passportJWT.Strategy,
  ExtractJWT = passportJWT.ExtractJwt;

passport.use(new LocalStrategy({
  usernameField: 'username',
  passwordField: 'password'
}, async (username, password, callback) => {
  console.log('Attempting to find user with username:', username);
  try {
    const user = await Users.findOne({ username: username });
    if (!user) {
      console.log('User not found in database');
      return callback(null, false, { message: 'Incorrect username or password.' });
    }
    console.log('User found:', user.username);
    
    // Use bcryptjs to compare the provided password with the stored hash
    const isValid = await bcryptjs.compare(password, user.password);
    console.log('Password validation result:', isValid);
    
    if (!isValid) {
      console.log('Password validation failed');
      return callback(null, false, { message: 'Incorrect password.' });
    }
    console.log('Authentication successful');
    return callback(null, user);
  } catch (error) {
    console.log('Error during authentication:', error);
    return callback(error);
  }
}));

passport.use(new JWTStrategy({
  jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
  secretOrKey: JWT_SECRET
}, async (jwtPayload, callback) => {
  console.log('JWT payload received:', 'JWT_SECRET', jwtPayload);
  try {
    const user = await Users.findById(jwtPayload._id);
    if (!user) {
      console.log('User not found for JWT payload');
      return callback(null, false);
    }
    console.log('User found for JWT payload:', user.username);
    return callback(null, user);
  } catch (error) {
    console.log('Error in JWT strategy:', error);
    return callback(error);
  }
}));

module.exports = passport;


