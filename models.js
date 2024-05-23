// models.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

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
    favorites: [{ type: Schema.Types.ObjectId, ref: 'Movie' }]
});

// Create models
const Movie = mongoose.model('Movie', MovieSchema);
const User = mongoose.model('User', UserSchema);

module.exports = { Movie, User };
