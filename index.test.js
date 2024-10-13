const Movie = require('./models/movie');

// Test case 1: Create a new movie
const newMovie = new Movie({
  title: 'The Shawshank Redemption',
  genre: 'Drama',
  director: 'Frank Darabont',
  releaseYear: 1994
});
console.log(newMovie);

// Test case 2: Update a movie's title
newMovie.title = 'The Godfather';
console.log(newMovie);

// Test case 3: Get a movie's genre
console.log(newMovie.genre);

// Test case 4: Get a movie's director
console.log(newMovie.director);

// Test case 5: Get a movie's release year
console.log(newMovie.releaseYear);