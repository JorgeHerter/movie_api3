
// index.js
require('dotenv').config();

const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types; // Import ObjectId from mongoose
const { Movie, User } = require('./models');
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const authRouter = require('./auth');
const app = express();
//passport athenticate
//const expressJwt = require('express-jwt');
//const authenticateJwt = expressJwt({ secret: 'a1b2c3d4e5f6',});

app.use(express.json());
app.use(bodyParser.json());//bodyparser dependencies
app.use(express.urlencoded({ extended: true }));//bodyparser middleware
app.use(morgan('combined'));
const cors = require('cors');
//app.use(cors());
let auth = require('./auth')(app);

app.use('/auth', authRouter); // use authRouter for routes starting with '/auth'

const passport = require('passport');

require('./passport');let allowedOrigins = ['http://localhost:8080', 'http://testsite.com'];

app.use(cors({
  origin: (origin, callback) => {
    if(!origin) return callback(null, true);
    if(allowedOrigins.indexOf(origin) === -1){ // If a specific origin isn’t found on the list of allowed origins
      let message = 'The CORS policy for this application doesn’t allow access from origin ' + origin;
      return callback(new Error(message ), false);
    }
    return callback(null, true);
  }
}));

//module.exports = authenticateJwt;

const connectToDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    }
};

connectToDatabase();

//CREATE
//Add a user
app.post('/users', [
    // Validation middleware
    check('username', 'Username is required with at least 5 characters').isLength({ min: 5 }),
    check('username', 'Username contains non-alphanumeric characters - not allowed.').isAlphanumeric(),
    check('email', 'Email does not appear to be valid').isEmail(),
    check('dateOfBirth', 'Date of Birth is required').not().isEmpty(),
    check('password', 'Password is required').not().isEmpty(),
    check('password', 'Password must include at least one uppercase letter and one number.')
        .matches(/^(?=.*[A-Z])(?=.*\d)/)
], async (req, res) => {
    console.log('Request Body:', req.body); // Log the entire request body

    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log('Validation Errors:', errors.array()); // Log validation errors
        return res.status(422).json({ errors: errors.array() });
    }

    console.log('Validation passed, proceeding to create user.');

    // Hash the password
    const hashedPassword = User.hashPassword(req.body.password);
    console.log('Hashed Password:', hashedPassword); // Log the hashed password

    // Create a new user instance
    const newUser = new User({
        username: req.body.username,
        password: hashedPassword,
        email: req.body.email,
        dateOfBirth: req.body.dateOfBirth
    });

    try {
        // Save the new user to the database
        const savedUser = await newUser.save();
        console.log('User saved successfully:', savedUser); // Log the saved user
        res.status(201).json({ message: "User created successfully", user: savedUser });
    } catch (error) {
        console.error('Error occurred while saving user:', error); // Log the error
        res.status(500).json({ message: "Error occurred while creating user", error });
    }
});



// UPDATE
// A user's info, by username
//passport.authenticate('jwt', { session: false }),

app.put('/users/:Username',  async (req, res) => {
    const requestedUsername = req.params.Username;
    const newUsername = req.body.username;

    try {
        // Check if the new username already exists
        if (newUsername) {
            const existingUser = await User.findOne({ username: newUsername });
            if (existingUser && existingUser.username !== requestedUsername) {
                return res.status(400).json({ message: 'Username already taken' });
            }
        }

        // Proceed with the update if the username is unique or unchanged
        const updatedUser = await User.findOneAndUpdate(
            { username: requestedUsername },
            {
                username: newUsername || requestedUsername, // Keep the old username if no new one provided
                password: req.body.password ? User.hashPassword(req.body.password) : undefined, // Hash only if a new password is provided
                email: req.body.email,
                dateOfBirth: req.body.dateOfBirth
            },
            { new: true, omitUndefined: true } // Omit undefined fields
        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(updatedUser);
    } catch (err) {
        console.error('Error occurred:', err);
        return res.status(500).send('Error: ' + err.message);
    }
});




// UPDATE
// Add a movie to a user's list of favorites
//passport.authenticate('jwt', { session: false }),
app.patch('/users/:Username/movies/:MovieID?', async (req, res) => {
    const { Username } = req.params;
    const { MovieID: bodyMovieID } = req.body; // From request body
    const urlMovieID = req.params.MovieID; // From URL

    // Use the MovieID from the body if provided, otherwise fall back to the URL
    const movieID = bodyMovieID || urlMovieID;

    if (!movieID) {
        return res.status(400).json({ message: 'MovieID is required' });
    }

    try {
        // Find the user with a case-insensitive username
        const user = await User.findOne({
            username: { $regex: new RegExp(`^${Username}$`, 'i') }
        });

        // Check if the user was found
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update the user's favoriteMovies array, adding MovieID if it's not already there
        const updatedUser = await User.findOneAndUpdate(
            { username: { $regex: new RegExp(`^${Username}$`, 'i') } },
            { $addToSet: { favoriteMovies: movieID } }, // Prevent duplicates
            { new: true } // Return the updated document
        );

        if (updatedUser) {
            return res.json(updatedUser.favoriteMovies);
        } else {
            return res.status(404).json({ message: 'User not found or no changes made' });
        }
    } catch (err) {
        console.error('Error occurred:', err);
        return res.status(500).json({ message: 'Error: ' + err.message });
    }
});


// DELETE
// Delete a movie from a user's list of favorites
//passport.authenticate('jwt', { session: false }),
app.delete('/users/:Username/movies/:MovieID', async (req, res) => {
    console.log('Username:', req.params.Username);
    console.log('MovieID:', req.params.MovieID);

    try {
        // Find the user with a case-insensitive username
        const user = await User.findOne({
            username: { $regex: new RegExp(`^${req.params.Username}$`, 'i') }
        });

        // Check if the user was found
        if (!user) {
            console.log('User not found');
            return res.status(404).json({ message: 'User not found' });
        }

        // Log current favorite movies before deletion
        console.log('Current Favorite Movies before deletion:', user.favoriteMovies);

        // Check if MovieID is a valid ObjectId
        let movieIdToDelete;
        try {
            movieIdToDelete = new mongoose.Types.ObjectId(req.params.MovieID);
        } catch (err) {
            console.log('Invalid ObjectId format, treating as string:', req.params.MovieID);
            movieIdToDelete = req.params.MovieID; // Treat as a string if invalid
        }

        // Update the user's favoriteMovies array, pulling MovieID
        const updatedUser = await User.findOneAndUpdate(
            { username: { $regex: new RegExp(`^${req.params.Username}$`, 'i') } },
            { $pull: { favoriteMovies: movieIdToDelete } }, // Remove MovieID from FavoriteMovies
            { new: true } // Return the updated document
        );

        // Log the updated user's favorite movies
        if (updatedUser) {
            console.log('Updated Favorite Movies after deletion:', updatedUser.favoriteMovies);
            return res.json(updatedUser.favoriteMovies);
        } else {
            console.log('User not updated or MovieID not found');
            return res.status(404).json({ message: 'User not found or MovieID not in favorites' });
        }
    } catch (err) {
        console.error('Error occurred:', err);
        return res.status(500).json({ message: 'Error: ' + err.message });
    }
});
//was able to delete user by username
// passport.authenticate('jwt', { session: false }),
app.delete('/users/:Username', async (req, res) => {
    const username = req.params.Username;
    try {
        // Use a case-insensitive regular expression for the username search
        const user = await User.findOneAndDelete({ 'username': { $regex: new RegExp(username, 'i') } });
        if (!user) {
            res.status(404).send(username + ' was not found');
        } else {
            res.status(200).send(username + ' was deleted.');
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Error: ' + err);
    }
});


// READ
app.get('/', async (req, res) => {
    res.send('Welcome to myFlix!');
});

// READ
//passport.authenticate('jwt', { session: false }),
app.get('/movies', async (req, res) => {
    try {
        const movies = await Movie.find();
        res.status(200).json(movies);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error: ' + error);
    }
});

// READ this was commented out 
/*app.get('/movies', passport.authenticate('jwt', { session: false }), async (req, res) => {
    await Movie.find()
        .then((movies) => {
            res.status(201).json(movies);
        })
        .catch((error) => {
            console.error(error);
            res.status(500).send('Error: ' + error);
        });
});
//This code does not return movie by title
//passport.authenticate('jwt', { session: false }),
app.get('/movies/:title', async (req, res) => {
    const title = req.params.title;
    try {
        const movie = await Movie.findOne({ title: { $regex: new RegExp(title, "i") } });
        if (movie) {
            res.status(200).json(movie);
        } else {
            res.status(404).send('Movie not found');
        }
    } catch (err) {
        res.status(500).send('Server error');
    }
});


// passport.authenticate('jwt', { session: false }),
app.get('/movies/genre/:genreName', async (req, res) => {
    console.log('error getting genre', req.params);
    const genre = req.params.genreName;
    try {
        
        const movies = await Movie.find({ 'genre.name': { $regex: new RegExp(genre, "i") } });
        
        if (movies && movies.length > 0) {
            
            const genres = movies.map(movie => movie.genre);
            res.status(200).json({ movies });
        } else {
            res.status(404).send('No movies found for the specified genre');
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Error: ' + err);
    }
});*/

// READ
//passport.authenticate('jwt', { session: false }), 
app.get('/movies/director/:directorName', async (req, res) => {
    console.log('error getting director', req.params);
    const director = req.params.directorName;
    try {
       
        const movies = await Movie.find({ 'director.name': { $regex: new RegExp(director, "i") } });

        if (movies && movies.length > 0) {
            const directors = movies.map(movie => movie.director);
            res.status(200).json({ movies });
        } else {
            res.status(404).send('No such director');
            
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Error: ' + err);
    }
});

// READ this was commented out
/*app.get('/movies/directors/:directorName', passport.authenticate('jwt', { session: false }), async (req, res) => {
    
    const director = req.params.directorName;
    try {
       
        const movies = await Movie.find({ 'director.name': { $regex: new RegExp(director, "i") } });

        if (movies && movies.length > 0) {
            const directors = movies.map(movie => movie.director);
            res.status(200).json({ movies });
        } else {
            res.status(404).send('No such director');
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Error: ' + err);
    }
});*/


//READ
app.get('/users', async (req, res) => {
    console.log(req.body);
    await User.find()
        .then((users) => {
            res.status(201).json(users);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

//READ
//passport.authenticate('jwt', { session: false }),
app.get('/users/:Username', async (req, res) => {
    try {
        let user = await User.findOne({ username: req.params.Username });
        console.log(user);
        res.json(user);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error: ' + err);
    }
});
//delete a user
app.delete('/users/:Username', async (req, res) => {
    const requestedUsername = req.params.Username;

    try {
        // Find the user and delete
        const deletedUser = await User.findOneAndDelete({
            username: { $regex: new RegExp(`^${requestedUsername}$`, 'i') }
        });

        if (!deletedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ message: 'User deleted successfully' });
    } catch (err) {
        console.error('Error occurred:', err);
        return res.status(500).json({ message: 'Error: ' + err.message });
    }
});



const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
    console.log('Listening on Port ' + port);
});

/*const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0',() => {
 console.log('Listening on Port ' + port);
});*/
 