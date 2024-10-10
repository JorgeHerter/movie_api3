const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

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

