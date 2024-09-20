
// models.js

/*const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');

// Define Movie Schema
const MovieSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    genre: { type: String, required: true },
    director: { type: String, required: true },
    imageUrl: { type: String, required: true },
    featured: { type: Boolean, default: false }
});

// Define User Schema
const UserSchema = new Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
    email: { type: String, required: true },
    dateOfBirth: { type: Date, required: true },
    favorites: [{ type: Schema.Types.ObjectId, ref: 'Movies' }]
});

let userSchema = mongoose.Schema({
    Username: {type: String, required: true},
    Password: {type: String, required: true},
    Email: {type: String, required: true},
    Birthday: Date,
    FavoriteMovies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }]
  });
  
  userSchema.statics.hashPassword = (password) => {
    return bcrypt.hashSync(password, 10);
  };
  
  userSchema.methods.validatePassword = function(password) {
    return bcrypt.compareSync(password, this.Password);
  };



//fix function to hash password

// Add validatePassword method to UserSchema
UserSchema.methods.validatePassword = function(password) {
    return this.password === password;
  };

// Create models
const Movie = mongoose.model('Movies', MovieSchema);
const User = mongoose.model('user', UserSchema);

module.exports = { Movie, User };
const mongoose = require('mongoose');

const movieId = mongoose.Types.ObjectId('your_movie_object_id_here'); // Get a valid ObjectId for updates
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');

// Define Movie Schema
const MovieSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    genre: { type: String, required: true },
    director: { type: String, required: true },
    imageUrl: { type: String, required: true },
    featured: { type: Boolean, default: false }
});

// Define User Schema
//favoriteMovies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movies' }]
const UserSchema = new Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    dateOfBirth: { type: Date, required: true },
    favoriteMovies: [{ type: String }] // Change to String if you're using string IDs
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

// Method to validate password
UserSchema.methods.validatePassword = function(password) {
    return bcrypt.compareSync(password, this.password);
};

// Create models
const Movie = mongoose.model('Movies', MovieSchema);
const User = mongoose.model('User', UserSchema); // Use 'User' for consistency

module.exports = { Movie, User };*/

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Define Movie Schema
const MovieSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    genre: { type: String, required: true },
    director: { type: String, required: true },
    imageUrl: { type: String, required: true },
    featured: { type: Boolean, default: false }
});

// Define User Schema
const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    dateOfBirth: { type: Date, required: true },
    favoriteMovies: [{ type: String }]
});

// Static method to hash password
UserSchema.statics.hashPassword = (password) => {
    return bcrypt.hashSync(password, 10);
};

// Instance method to validate password
UserSchema.methods.validatePassword = function(password) {
    return bcrypt.compareSync(password, this.password);
};

// Create models
const Movie = mongoose.model('Movie', MovieSchema);
const User = mongoose.model('User', UserSchema);

module.exports = { Movie, User };

