// index.js

const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
//const uuid = require('uuid');
const passport = require('passport');
const { Movie, User } = require('./models');
const auth = require('./auth');
//const { check, validationResult } = require('express-validator');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined'));
app.use(passport.initialize());
auth(app);

const connectToDatabase = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/local.myFlixDB', {
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
app.post('/userDB', [
    check('Username', 'Username is required with at least 5 characters').isLength({ min: 5 }),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Email does not appear to be valid').isEmail()
], async (req, res) => {
    // check the validation object for errors
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    let hashedPassword = Users.hashPassword(req.body.Password);
    await Users.findOne({ Username: req.body.Username })
        .then((user) => {
            if (user) {
                return res.status(400).send(req.body.Username + ' already exists');
            } else {
                Users
                    .create({
                        Username: req.body.Username,
                        Password: hashedPassword,
                        Email: req.body.Email,
                        Birthday: req.body.Birthday
                    })
                    .then((user) => { res.status(201).json(user) })
                    .catch((error) => {
                        console.error(error);
                        res.status(500).send('Error: ' + error);
                    })
            }
        })
        .catch((error) => {
            console.error(error);
            res.status(500).send('Error: ' + error);
        });
});

// UPDATE
// A user's info, by username
app.put('./userDB/:Username', passport.authenticate('jwt', { session: false }), async (req, res) => {
    //CONDITION TO CHECK ADDED HERE
    if (req.user.Username !== req.params.Username) {
        return res.status(400).send('Permission denied');
    }
    // CONDITION ENDS
    await Users.findOneAndUpdate({ Username: req.params.Username }, {
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
app.patch('./userDB/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false }), async (req, res) => {
    await Users.findOneAndUpdate({ Username: req.params.Username }, {
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
app.delete('./userDB/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false }), async (req, res) => {
    await Users.findOneAndUpdate({ Username: req.params.Username }, {
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

// DELETE
// Delete a user by username
app.delete('./userDB/:Username', passport.authenticate('jwt', { session: false }), async (req, res) => {

    await Users.findOneAndDelete({ Username: req.params.Username })
        .then((user) => {
            if (!user) {
                res.status(404).send(req.params.Username + ' was not found');
            } else {
                res.status(200).send(req.params.Username + ' was deleted.');
            }
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

// READ
app.get('/', (req, res) => {
    res.send('Welcome to myFlix!');
});

// READ
app.get('/movies', passport.authenticate('jwt', { session: false }), async (req, res) => {
    await Movies.find()
        .then((movies) => {
            res.status(201).json(movies);
        })
        .catch((error) => {
            console.error(error);
            res.status(500).send('Error: ' + error);
        });
});

// READ
app.get('/movies/:title', passport.authenticate('jwt', { session: false }), async (req, res) => {

    const title = req.params.title;
    const movie = await Movies.findOne({ Title: title });

    if (movie) {
        res.status(200).json(movie);
    } else {
        res.status(404).send('Movie not found');
    }

});

// READ
app.get('/movies/genre/:genreName', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const genreName = req.params.genreName;
        const movie = await Movies.findOne({ 'Genre.Name': genreName });

        if (movie) {
            res.status(200).json(movie.Genre);
        } else {
            res.status(404).send('No such genre found');
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Error: ' + err);
    }
});

// READ
app.get('/movies/directors/:directorName', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const directorName = req.params.directorName;
        const movie = await Movies.findOne({ 'Director.Name': directorName });

        if (movie) {
            res.status(200).json(movie.Director);
        } else {
            res.status(404).send('No such director');
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Error: ' + err);
    }
});

//READ
app.get('./userDB', passport.authenticate('jwt', { session: false }), async (req, res) => {
    await Users.find()
        .then((users) => {
            res.status(201).json(users);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

//READ
app.get('./userDB/:Username', passport.authenticate('jwt', { session: false }), async (req, res) => {
    await Users.findOne({ Username: req.params.Username })
        .then((user) => {
            res.json(user);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

// Endpoint to list all movies
/*app.get('/movies', async (req, res) => {
    res.send('Successful GET request returning data on all the movies');
  });
  
  // Endpoint to add a new movie
  app.post('/movies', passport.authenticate('jwt', { session: false }), async (req, res) => {
    res.send('Successful POST request adding a new movie');
  });
  
  // Endpoint to return data about a single movie
  app.get('/movies/:movieTitle', async (req, res) => {
    res.send('Successful GET request returning data about a single movie');
  });
  
  // Endpoint to update data about a single movie
  app.put('/movies/:movieTitle', passport.authenticate('jwt', { session: false }), async (req, res) => {
    res.send('Successful PUT request updating data about a single movie');
  });
  
  // Endpoint to delete a movie
  app.delete('/movies/:movieTitle', passport.authenticate('jwt', { session: false }), async (req, res) => {
    res.send('Successful DELETE request deleting a movie');
  });*/
  
  const PORT = 8080;
  
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
  
  
  // Start the server
  /*app.listen(3000, () => {
    console.log('Server is running on port 3000');
  });*/