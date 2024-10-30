
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const passport = require('passport');

require('./passport'); // Your local passport file

//const jwtSecret = 'your_jwt_secret'; // This should be in an environment variable in a real application
const jwtSecret = process.env.JWT_SECRET;

let generateJWTToken = (user) => {
  return jwt.sign(user, jwtSecret, {
    subject: user.username, // Changed from Username to username to match your model
    expiresIn: '14d',
    algorithm: 'HS256'
  });
}

/* POST login. */
router.post('/login', (req, res) => {
  console.log('Login attempt:', req.body);

  // Basic validation
  if (!req.body.username || !req.body.password) {
    console.log('Login failed: Missing username or password');
    return res.status(400).json({ message: 'Both username and password are required.' });
  }

  passport.authenticate('local', { session: false }, (error, user, info) => {
    console.log('Passport authenticate result:', { error, user, info });
    if (error) {
      console.log('Login error:', error);
      return res.status(500).json({ message: 'Error during authentication', error: error });
    }
    if (!user) {
      console.log('Login failed:', info.message);
      return res.status(400).json({
        message: 'Authentication failed',
        info: info
      });
    }
    
    req.login(user, { session: false }, (error) => {
      if (error) {
        console.log('Login error:', error);
        return res.status(500).json({ message: 'Error during login', error: error });
      }
      let token = generateJWTToken(user.toJSON());
      console.log('Login successful for user:', user.username);
      return res.json({ user, token });
    });
  })(req, res);
});

module.exports = router;
