
# Movie API Documentation

Welcome to the Movie API! This API allows you to manage users and movies. Below are the endpoints available for use.

## Base URL
https://movie-api1-fbc239963864.herokuapp.com/

## Authentication
Some endpoints require authentication using JWT. Make sure to include the token in the `Authorization` header as follows:
Authorization: Bearer YOUR_JWT_TOKEN

## Endpoints

### 1. Base Route
- **GET** `/`
  - **Description**: Returns a welcome message.
  - **Response**: 
    ```json
    {
      "message": "Welcome to myFlix!"
    }
    ```

### 2. Test Route
- **GET** `/test`
  - **Description**: Tests if the API is working.
  - **Response**:
    ```json
    {
      "message": "Express is working"
    }
    ```

### 3. Users

#### Create a User
- **POST** `/users`
  - **Description**: Adds a new user.
  - **Body**:
    ```json
    {
      "username": "exampleUser",
      "email": "user@example.com",
      "dateOfBirth": "YYYY-MM-DD",
      "password": "examplePassword"
    }
    ```
  - **Response**:
    - Success (201):
      ```json
      {
        "message": "User created successfully",
        "user": { ...user data... }
      }
      ```
    - Error (422):
      ```json
      {
        "errors": [{ ...validation errors... }]
      }
      ```

#### Get All Users
- **GET** `/users`
  - **Description**: Retrieves a list of all users.
  - **Response**:
    ```json
    [
      { ...user data... },
      { ...user data... }
    ]
    ```

#### Get a User by Username
- **GET** `/users/:Username`
  - **Description**: Retrieves a specific user by username.
  - **Response**:
    - Success (200):
      ```json
      { ...user data... }
      ```
    - Error (404):
      ```json
      {
        "message": "User not found"
      }
      ```

#### Update User Information
- **PUT** `/users/:Username`
  - **Description**: Updates user information.
  - **Body**:
    ```json
    {
      "username": "newUsername",
      "email": "newEmail@example.com",
      "dateOfBirth": "YYYY-MM-DD",
      "password": "newPassword"
    }
    ```
  - **Response**:
    - Success (200):
      ```json
      { ...updated user data... }
      ```
    - Error (404):
      ```json
      {
        "message": "User not found"
      }
      ```

#### Delete a User
- **DELETE** `/users/:Username`
  - **Description**: Deletes a user by username.
  - **Response**:
    - Success (200):
      ```json
      {
        "message": "User deleted successfully"
      }
      ```
    - Error (404):
      ```json
      {
        "message": "User not found"
      }
      ```

### 4. Movies

#### Get All Movies
- **GET** `/movies`
  - **Description**: Retrieves a list of all movies.
  - **Response**:
    ```json
    [
      { ...movie data... },
      { ...movie data... }
    ]
    ```

#### Get a Movie by Title
- **GET** `/movies/:title`
  - **Description**: Retrieves a specific movie by title.
  - **Response**:
    - Success (200):
      ```json
      { ...movie data... }
      ```
    - Error (404):
      ```json
      {
        "message": "Movie not found"
      }
      ```

#### Get Movies by Genre
- **GET** `/movies/genre/:genreName`
  - **Description**: Retrieves a list of movies by genre.
  - **Response**:
    - Success (200):
      ```json
      {
        "movies": [{ ...movie data... }]
      }
      ```
    - Error (404):
      ```json
      {
        "message": "No movies found for the specified genre"
      }
      ```

#### Get Movies by Director
- **GET** `/movies/director/:directorName`
  - **Description**: Retrieves a list of movies directed by a specific director.
  - **Response**:
    - Success (200):
      ```json
      {
        "movies": [{ ...movie data... }]
      }
      ```
    - Error (404):
      ```json
      {
        "message": "No movies found for the specified director"
      }
      ```

### 5. User Favorites

#### Add a Movie to User Favorites
- **PATCH** `/users/:Username/movies/:MovieID?`
  - **Description**: Adds a movie to a user's list of favorite movies.
  - **Body** (optional):
    ```json
    {
      "MovieID": "movieID123"
    }
    ```
  - **Response**:
    - Success (200):
      ```json
      [
        "movieID1",
        "movieID2"
      ]
      ```
    - Error (404):
      ```json
      {
        "message": "User not found"
      }
      ```

#### Delete a Movie from User Favorites
- **DELETE** `/users/:Username/movies/:MovieID`
  - **Description**: Deletes a movie from a user's list of favorite movies.
  - **Response**:
    - Success (200):
      ```json
      [
        "movieID1",
        "movieID2"
      ]
      ```
    - Error (404):
      ```json
      {
        "message": "User not found or MovieID not in favorites"
      }
      ```

## Error Handling
In case of an error, the API will return appropriate status codes and messages. Common errors include:

- **400 Bad Request**: Invalid input.
- **404 Not Found**: Resource not found.
- **500 Internal Server Error**: Server-side error.

## Conclusion
This API provides a full-fledged interface for managing users and movies. Make sure to handle JWT authentication where required and test each endpoint to ensure functionality.

