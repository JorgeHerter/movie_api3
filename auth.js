const express = require('express');
const passport = require('passport');
const router = express.Router();
const jwt = require('jsonwebtoken');

// JWT Token generation function
const generateJWTToken = (user) => {
    return jwt.sign(user, process.env.JWT_SECRET || 'a1b2c3d4e5f6', {
        subject: user.username,
        expiresIn: '7d',
        algorithm: 'HS256',
    });
};
// Login endpoint
router.post('/', (req, res) => {
    console.log('Login endpoint hit');
    console.log('Request Body:', req.body);

    passport.authenticate('local', { session: false }, (error, user, info) => {
        if (error || !user) {
            return res.status(400).json({
                message: 'Something is not right',
                user: user,
            });
        }
        req.login(user, { session: false }, (error) => {
            if (error) {
                return res.send(error);
            }
            const token = generateJWTToken(user.toJSON());
            return res.json({ user, token });
        });
    })(req, res);
});

module.exports = router; // Ensure this line is present