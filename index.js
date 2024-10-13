// index.js
const dotenv = require('dotenv').config();
const express = require('express');
       morgan = require('morgan'),
       mongoose = require('mongoose');
const { Movie, User } = require('./models');
const { check, validationResult } = require('express-validator');
const bodyParser = require('body-parser');
const passport = require('./passport'); // Import passport
const authRouter = require('./auth'); // Import authRouter directly
const cors = require('cors');


const app = express();

// Log incoming requests
/*app.use((req, res, next) => {
    console.log(`${req.method} request for '${req.url}'`);
    next(); // Call the next middleware or route handler
});*/

// Middleware setup
app.use(express.json());
//app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined'));
app.use(express.static('public'));
app.use(passport.initialize()); // Initialize passport
app.use('/login', authRouter);
/*app.get('/test', (req, res) => {
    res.send('Test route works!');
});*/

// CORS setup
const allowedOrigins = ['http://localhost:8080', 'http://testsite.com'];
app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (!allowedOrigins.includes(origin)) {
            const message = 'The CORS policy for this application doesn’t allow access from origin ' + origin;
            return callback(new Error(message), false);
        }
        return callback(null, true);
    }
}));

// MongoDB connection
const connectToDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    }
};

connectToDatabase();

// Authentication routes
app.use('/auth', authRouter);

// Welcome Route
app.get('/', async (req, res) => {
    res.send('Welcome to myFlix!');
});

// User CRUD Operations

// CREATE
// Add a user
app.post('/users', [
    // Validation middleware
    check('username', 'Username is required with at least 5 characters').isLength({ min: 5 }),
    check('username', 'Username contains non-alphanumeric characters - not allowed.').isAlphanumeric(),
    check('email', 'Email does not appear to be valid').isEmail(),
    check('dateOfBirth', 'Date of Birth is required').not().isEmpty(),
    check('password', 'Password is required').not().isEmpty(),
    check('password', 'Password must include at least one uppercase letter and one number.').matches(/^(?=.*[A-Z])(?=.*\d)/)
], async (req, res) => {
    // Logic for creating a new user
});

// READ
// Get all users
app.get('/users', async (req, res) => {
    await User.find()
        .then((users) => res.status(201).json(users))
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

// Get user by username
app.get('/users/:Username', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        let user = await User.findOne({ username: req.params.Username });
        res.json(user);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error: ' + err);
    }
});

// UPDATE
// Update a user's info by username
app.put('/users/:Username', passport.authenticate('jwt', { session: false }), async (req, res) => {
    // Logic for updating user info
});

// Add a movie to a user's list of favorites
app.patch('/users/:Username/movies/:MovieID?', passport.authenticate('jwt', { session: false }), async (req, res) => {
    // Logic for adding a movie to favorites
});

// DELETE
// Delete a user by username
app.delete('/users/:Username', passport.authenticate('jwt', { session: false }), async (req, res) => {
    const requestedUsername = req.params.Username;

    try {
        const deletedUser = await User.findOneAndDelete({ username: { $regex: new RegExp(`^${requestedUsername}$`, 'i') } });

        if (!deletedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ message: 'User deleted successfully' });
    } catch (err) {
        console.error('Error occurred:', err);
        return res.status(500).json({ message: 'Error: ' + err.message });
    }
});

// Delete a movie from a user's list of favorites
app.delete('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false }), async (req, res) => {
    // Logic for deleting a movie from favorites
});

// Movie CRUD Operations

// READ
// Get all movies
app.get('/movies', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const movies = await Movie.find();
        res.status(200).json(movies);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error: ' + error);
    }
});

// Get movie by title
app.get('/movies/:title', passport.authenticate('jwt', { session: false }), async (req, res) => {
    const title = req.params.title;

    if (!title || typeof title !== 'string') {
        return res.status(400).json({ message: 'Invalid title' });
    }

    try {
        const movie = await Movie.findOne({ title: { $regex: new RegExp(title, "i") } });
        
        if (movie) {
            return res.status(200).json(movie);
        } else {
            return res.status(404).json({ message: 'Movie not found' });
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error' });
    }
});

// Get movies by genre
app.get('/movies/genre/:genreName', passport.authenticate('jwt', { session: false }), async (req, res) => {
    const genre = req.params.genreName;
    try {
        const movies = await Movie.find({ 'genre.name': { $regex: new RegExp(genre, "i") } });
        if (movies && movies.length > 0) {
            res.status(200).json({ movies });
        } else {
            res.status(404).send('No movies found for the specified genre');
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Error: ' + err);
    }
});

// Get movies by director
app.get('/movies/director/:directorName', passport.authenticate('jwt', { session: false }), async (req, res) => {
    const director = req.params.directorName;
    try {
        const movies = await Movie.find({ 'director.name': { $regex: new RegExp(director, "i") } });
        
        if (movies && movies.length > 0) {
            res.status(200).json({ movies });
        } else {
            res.status(404).send('No such director');
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Error: ' + err);
    }
});


const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
    console.log('Listening on Port ' + port);
});

