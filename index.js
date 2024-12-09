const dotenv = require('dotenv').config(),
      express = require("express"),
      morgan = require('morgan'),
      mongoose = require('mongoose'),
      cors = require('cors');
const bodyParser =require('body-parser');      

const passport = require('passport');
require('./passport');                
console.log('passport imported');

const { check, validationResult } = require('express-validator');

const bcryptjs = require('bcryptjs');
const Models = require('./models.js');
const User = Models.User;  // Change this line
const Movie = Models.Movie;  // Change this line if you want to be consistent

const path = require('path');

// Initialize Express app
const app = express();

// Middleware
app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
//app.use(express.static('public'));
// Assuming your static files are in the 'public' folder
//app.use(express.static(path.join(__dirname, 'public')));

//const path = require('path');
app.use('/favicon.ico', express.static(path.join(__dirname, 'public', 'favicon.ico')));


// CORS configuration
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5000',
    'http://localhost:8080',
   'https://jorgemyflixapp.netlify.app'
];
const corsOptions = {
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      const message = `The CORS policy for this application doesn't allow access from origin ${origin}`;
      return callback(new Error(message), false);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,  // Allow cookies or authorization tokens to be sent
  };

  // Use CORS for all routes
  app.use(cors(corsOptions));
  
  app.options('*', cors(corsOptions)); // Handle preflight for all routes

/*app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        const message = `The CORS policy for this application doesn't allow access from origin ${origin}`;
        return callback(new Error(message), false);
    }
}));*/
// Initialize Passport
//app.use(passport.initialize());

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

// Logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} request for '${req.url}'`);
  next();

});

// Import and use authentication routes
const authRouter = require('./auth');
console.log('Auth router type:', typeof authRouter);
console.log('Auth router methods:', Object.keys(authRouter));

// If authRouter is a function (middleware), use it directly
if (typeof authRouter === 'function') {
  app.use('/', authRouter);
} else if (typeof authRouter === 'object' && typeof authRouter.router === 'function') {
  // If authRouter is an object with a router property, use that
  app.use('/', authRouter.router);
} else {
  console.error('Invalid auth router:', authRouter);
}

//app.use('/', authRouter);


// Log all registered routes
console.log('Registered routes:');
app._router.stack.forEach(function(r){
  if (r.route && r.route.path){
    console.log(r.route.path)
  }
});

app.use(passport.initialize());

// Base route
app.get('/', (req, res) => {
    res.send('Welcome to myFlix!');
});

// Favicon route
//app.get('/favicon.ico', (req, res) => res.status(204));

// Test route
app.get('/test', (req, res) => {
    res.json({ message: 'Express is working' });
});

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
    console.log('Request Body:', req.body);

    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log('Validation Errors:', errors.array());
        return res.status(422).json({ errors: errors.array() });
    }

    console.log('Validation passed, proceeding to create user.');

    try {
        // Hash the password
        const hashedPassword = bcryptjs.hashSync(req.body.password, 10);
        console.log('Hashed Password:', hashedPassword);

        // Create a new user instance
        const newUser = new User({
            username: req.body.username,
            password: hashedPassword,
            email: req.body.email,
            dateOfBirth: req.body.dateOfBirth
        });

        // Save the new user to the database
        const savedUser = await newUser.save();
        console.log('User saved successfully:', savedUser);
        res.status(201).json({ message: "User created successfully", user: savedUser });
    } catch (error) {
        console.error('Error occurred while saving user:', error);
        if (error.code === 11000) {
            res.status(400).json({ message: "Username or email already exists" });
        } else {
            res.status(500).json({ message: "Error occurred while creating user", error: error.message });
        }
    }
});

// UPDATE
// A user's info, by username
//inserted passport

app.put('/users/:Username', passport.authenticate('jwt', { session: false }),  async (req, res) => {
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
app.patch('/users/:Username/movies/:MovieID?', passport.authenticate('jwt', { session: false }), async (req, res) => {
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
//
app.delete('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false }), async (req, res) => {
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
// 
/*app.delete('/users/:Username', passport.authenticate('jwt', { session: false }), async (req, res) => {
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
});*/

app.delete('/users/:Username', passport.authenticate('jwt', { session: false }), async (req, res) => {
    const username = req.params.Username;
    console.log('Attempting to delete user:', username);

    try {
        // Use a case-insensitive regular expression for the username search
        const user = await User.findOne({ username: { $regex: new RegExp(`^${username}$`, 'i') } });

        // Check if the user was found
        if (!user) {
            console.log('User not found:', username);
            return res.status(404).json({ message: `${username} was not found` });
        }

        // Proceed to delete the user
        const deletedUser = await User.findOneAndDelete({ username: { $regex: new RegExp(`^${username}$`, 'i') } });

        // If the user was deleted, return success
        if (deletedUser) {
            console.log('User deleted successfully:', username);
            return res.status(200).json({ message: `${username} was deleted.` });
        } else {
            console.log('User not deleted for an unknown reason');
            return res.status(404).json({ message: `${username} could not be deleted` });
        }
    } catch (err) {
        console.error('Error occurred:', err);
        return res.status(500).json({ message: 'Error: ' + err.message });
    }
});

// READ

app.get('/movies', (req, res, next) => {
    console.log('GET /movies route hit');
    console.log('Headers:', req.headers);
    next();
  }, passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
      console.log('Authentication passed, fetching movies');
      const movies = await Movie.find();
      console.log(`Found ${movies.length} movies`);
      res.status(200).json(movies);
    } catch (error) {
      console.error('Error fetching movies:', error);
      res.status(500).send('Error: ' + error.message);
    }
  });

  app.get('/movies/public', async (req, res) => {
  try {
    // Only return the title and imagePath fields
    const movies = await Movie.find().select('title imagePath'); 
    console.log(`Found ${movies.length} movies`);

    // Send the list of movies with titles and imagePaths
    res.status(200).json(movies);
  } catch (error) {
    console.error('Error fetching movies:', error);
    res.status(500).send('Error: ' + error.message);
  }
});

app.get('/users/:username/movies', 
    (req, res, next) => {
        console.log('GET /users/:username/movies route hit');
        console.log('Headers:', req.headers);
        
        // Authenticate the request
        passport.authenticate('jwt', { session: false }, (err, user, info) => {
            if (err) {
                console.error('Authentication error:', err);
                return next(err);
            }
            if (!user) {
                console.log('Unauthorized access: No user found');
                return res.status(401).json({ message: 'Unauthorized' });
            }
            req.user = user; // Attach user to the request object
            next(); // Proceed to the next middleware
        })(req, res, next);
    },
    async (req, res) => {
        const { username } = req.params;

        try {
            // Validate the username input
            if (!username || typeof username !== 'string') {
                console.log('Invalid username input:', username);
                return res.status(400).json({ message: 'Invalid username' });
            }

            console.log(`Fetching favorite movies for user: ${username}`);
            
            // Assuming that the User model has a 'favorites' array to store movie IDs
            const user = await User.findOne({ username: username }).populate('favorites');
            
            if (user) {
                // If user is found, return their favorite movies
                console.log(`Favorites fetched for ${username}:`, user.favorites);
                return res.status(200).json(user.favorites);
            } else {
                console.log(`User not found: ${username}`);
                return res.status(404).json({ message: 'User not found' });
            }
        } catch (err) {
            console.error('Error occurred while fetching favorite movies:', err);
            return res.status(500).json({ message: 'Server error', error: err.message });
        }
    }
);
  
app.get('/movies/:title', 
    (req, res, next) => {
        console.log('GET /movies/:title route hit');
        console.log('Headers:', req.headers);
        
        // Authenticate the request
        passport.authenticate('jwt', { session: false }, (err, user, info) => {
            if (err) {
                console.error('Authentication error:', err);
                return next(err);
            }
            if (!user) {
                console.log('Unauthorized access: No user found');
                return res.status(401).json({ message: 'Unauthorized' });
            }
            req.user = user; // Attach user to the request object
            next(); // Proceed to the next middleware
        })(req, res, next);
    }, 
    async (req, res) => {
        const title = req.params.title;

        // Validate input
        if (!title || typeof title !== 'string') {
            console.log('Invalid title input:', title);
            return res.status(400).json({ message: 'Invalid title' });
        }

        try {
            console.log(`Searching for movie: ${title}`);
            const movie = await Movie.findOne({ title: { $regex: new RegExp(title, "i") } });

            if (movie) {
                console.log(`Movie found: ${movie.title}`);
                return res.status(200).json(movie);
            } else {
                console.log(`Movie not found: ${title}`);
                return res.status(404).json({ message: 'Movie not found' });
            }
        } catch (err) {
            console.error('Error occurred while searching for movie:', err);
            return res.status(500).json({ message: 'Server error', error: err.message });
        }
    }
);

app.get('/genre/:genreName', 
    (req, res, next) => {
        console.log('GET /movies/genre/:genreName route hit');
        console.log('Headers:', req.headers);
        
        // Authenticate the request
        passport.authenticate('jwt', { session: false }, (err, user, info) => {
            if (err) {
                console.error('Authentication error:', err);
                return next(err);
            }
            if (!user) {
                console.log('Unauthorized access: No user found');
                return res.status(401).json({ message: 'Unauthorized' });
            }
            req.user = user; // Attach user to the request object
            next(); // Proceed to the next middleware
        })(req, res, next);
    }, 
    async (req, res) => {
        const genre = req.params.genreName;

        // Validate input
        if (!genre || typeof genre !== 'string') {
            console.log('Invalid genre input:', genre);
            return res.status(400).json({ message: 'Invalid genre' });
        }

        try {
            console.log(`Searching for movies in genre: ${genre}`);
            const movies = await Movie.find({ 'genre.name': { $regex: new RegExp(genre, "i") } });

            if (movies && movies.length > 0) {
                console.log(`Movies found for genre: ${genre}`);
                return res.status(200).json({ movies });
            } else {
                console.log(`No movies found for genre: ${genre}`);
                return res.status(404).json({ message: 'No movies found for the specified genre' });
            }
        } catch (err) {
            console.error('Error occurred while searching for movies by genre:', err);
            return res.status(500).json({ message: 'Server error', error: err.message });
        }
    }
);

// READ

app.get('/movies/director/:directorName', 
    passport.authenticate('jwt', { session: false }), 
    async (req, res) => {
        console.log('GET /movies/director/:directorName route hit');
        console.log('Headers:', req.headers);
        
        const director = req.params.directorName.trim(); // Trim whitespace

        // Validate input
        if (!director || typeof director !== 'string') {
            console.log('Invalid director input:', director);
            return res.status(400).json({ message: 'Invalid director' });
        }

        try {
            console.log(`Searching for movies directed by: ${director}`);
            const movies = await Movie.find({ 'director.name': { $regex: new RegExp(director, "i") } });

            if (movies && movies.length > 0) {
                console.log(`Movies found for director: ${director}`);
                return res.status(200).json({ movies });
            } else {
                console.log(`No movies found for director: ${director}`);
                return res.status(404).json({ message: 'No movies found for the specified director' });
            }
        } catch (err) {
            console.error('Error occurred while searching for movies by director:', err);
            return res.status(500).json({ message: 'Server error', error: err.message });
        }
    }
);


//READ
/*app.get('/users', async (req, res) => {
    console.log(req.body);
    await User.find()
        .then((users) => {
            res.status(201).json(users);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});*/

//READ
app.get('/users/:Username', 
    passport.authenticate('jwt', { session: false }), 
    async (req, res) => {
        console.log('GET /users/:Username route hit');
        console.log('Headers:', req.headers);
        console.log('Params:', req.params);

        const username = req.params.Username;

        // Validate input
        if (!username || typeof username !== 'string') {
            console.log('Invalid username input:', username);
            return res.status(400).json({ message: 'Invalid username' });
        }

        try {
            console.log(`Searching for user: ${username}`);
            const user = await User.findOne({ username: username });

            if (user) {
                console.log('User found:', user);
                return res.json(user);
            } else {
                console.log('User not found:', username);
                return res.status(404).json({ message: 'User not found' });
            }
        } catch (err) {
            console.error('Error occurred while searching for user:', err);
            return res.status(500).json({ message: 'Server error', error: err.message });
        }
    }
);

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

// Catch-all route
app.use('*', (req, res) => {
    res.status(404).send('Route not found');
  });
  
  // Error handling middleware
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
  });
  
  // Test route
  app.get('/test', (req, res) => {
      res.json({ message: 'Express is working' });
  });

// listen for requests
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Your app is listening on port ${port}`);
});