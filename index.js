
// index.js

const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const { Movie, User } = require('./models');
const { check, validationResult } = require('express-validator');
const bodyParser = require('body-parser');
const authRouter = require('./auth');
const app = express();
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
    await mongoose.connect('mongodb://127.0.0.1:27017/myFlixDB', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
}

connectToDatabase();

//CREATE
//Add a user
app.post('/users', [
    // Validation logic here for request
    check('username', 'Username is required with at least 5 characters').isLength({ min: 5 }),
    check('username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
    check('dateOfBirth', 'dateOfBirth is required').not().isEmpty(),
    check('password', 'password is required').not().isEmpty(),
    check('password', 'Password contains non alphanumeric characters - not allowed.').isAlphanumeric(),
    check('password', 'Password must include at least one uppercase letter and one number.')
    .matches(/^(?=.*[A-Z])(?=.*\d)/),
    check('email', 'email does not appear to be valid').isEmail()
], async (req, res) => {
    console.log(req.body);
    // check the validation object for errors
    let errors = validationResult(req);
    console.log(errors, req.body);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    //let hashedPassword = User.hashedPassword(req.body.Password);
    let hashedPassword = req.body.password;
    let user = await User.findOne({ username: req.body.username });
    console.log(user);
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }
    user = new User({
      username: req.body.username,
      password: hashedPassword,
      dateOfBirth: req.body.dateOfBirth,
      email: req.body.email
    });
    try {
      await user.save();
      res.status(201).json({ message: "User created successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error occurred while creating user", error });
   
    }
});


// UPDATE
// A user's info, by username
app.put('/users/:Username', passport.authenticate('jwt', { session: false }), async (req, res) => {
    //CONDITION TO CHECK ADDED HERE
    if (req.user.Username !== req.params.Username) {
        return res.status(400).send('Permission denied');
    }
    // CONDITION ENDS
    await User.findOneAndUpdate({ Username: req.params.Username }, {
        $set:
        {
            Username: req.body.Username,
            Password: req.body.Password,
            Email: req.body.Email,
            Birthday: req.body.Birthday
        }
    },
        { new: true }) // This line makes sure that the updated document is returned
        .then((updatedUser) => {
            res.json(updatedUser);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        })

});

  
// UPDATE
// Add a movie to a user's list of favorites
app.patch('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false }), async (req, res) => {
    await User.findOneAndUpdate({ Username: req.params.Username }, {
        $push: { FavoriteMovies: req.params.MovieID }
    },
        { new: true }) // This line makes sure that the updated document is returned
        .then((updatedUser) => {
            res.json(updatedUser);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});


// DELETE
// Delete a movie from a user's list of favorites
app.delete('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false }), async (req, res) => {
    await User.findOneAndUpdate({ Username: req.params.Username }, {
        $pull: { FavoriteMovies: req.params.MovieID }
    },
        { new: true }) // This line makes sure that the updated document is returned
        .then((updatedUser) => {
            res.json(updatedUser);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});


//was able to delete user by username
app.delete('/users/:Username', passport.authenticate('jwt', { session: false }), async (req, res) => {
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
app.get('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
    res.send('Welcome to myFlix!');
});

// READ
app.get('/movies', passport.authenticate('jwt', { session: false }), async (req, res) => {
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
app.get('/movies/:title', passport.authenticate('jwt', { session: false }), async (req, res) => {
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



app.get('/movies/genre/:genreName', passport.authenticate('jwt', { session: false }), async (req, res) => {
    
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
});

// READ
app.get('/movies/directors/:directorName', passport.authenticate('jwt', { session: false }), async (req, res) => {
    
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

// READ
app.get('/movies/directors/:directorName', passport.authenticate('jwt', { session: false }), async (req, res) => {
    
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
app.get('/users/:Username', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        let user = await User.findOne({ username: req.params.Username });
        console.log(user);
        res.json(user);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error: ' + err);
    }
});


const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0',() => {
 console.log('Listening on Port ' + port);
});
  
  /*const PORT = 8080;
  
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });*/
  
  