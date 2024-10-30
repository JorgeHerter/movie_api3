# API Documentation for MyFlix App

## Base URL
https://movie-api1-fbc239963864.herokuapp.com/

## Authentication

### Login
- **Endpoint:** `/login`
- **Method:** `POST`
- **Description:** Authenticates a user and returns a JWT token.
- **Request Body:**
    ```json
    {
        "username": "your_username",
        "password": "your_password"
    }
    ```
- **Responses:**
    - **200 OK**
        ```json
        {
            "user": {
                "username": "your_username",
                "email": "your_email",
                "dateOfBirth": "YYYY-MM-DD",
                "favoriteMovies": []
            },
            "token": "your_jwt_token"
        }
        ```
    - **400 Bad Request**
        ```json
        {
            "message": "Both username and password are required."
        }
        ```
    - **500 Internal Server Error**
        ```json
        {
            "message": "Error during authentication",
            "error": "error_details"
        }
        ```

## Users

### Create a User
- **Endpoint:** `/users`
- **Method:** `POST`
- **Description:** Registers a new user.
- **Request Body:**
    ```json
    {
        "username": "your_username",
        "email": "your_email",
        "dateOfBirth": "YYYY-MM-DD",
        "password": "your_password"
    }
    ```
- **Responses:**
    - **201 Created**
        ```json
        {
            "message": "User created successfully",
            "user": {
                "username": "your_username",
                "email": "your_email",
                "dateOfBirth": "YYYY-MM-DD",
                "favoriteMovies": []
            }
        }
        ```
    - **422 Unprocessable Entity**
        ```json
        {
            "errors": [
                {
                    "msg": "Username is required with at least 5 characters",
                    "param": "username"
                },
                ...
            ]
        }
        ```

### Get All Users
- **Endpoint:** `/users`
- **Method:** `GET`
- **Description:** Retrieves a list of all users.
- **Responses:**
    - **200 OK**
        ```json
        [
            {
                "username": "user1",
                "email": "user1@example.com",
                ...
            },
            ...
        ]
        ```

### Get User by Username
- **Endpoint:** `/users/:Username`
- **Method:** `GET`
- **Description:** Retrieves a user by their username.
- **Responses:**
    - **200 OK**
        ```json
        {
            "username": "your_username",
            "email": "your_email",
            "dateOfBirth": "YYYY-MM-DD",
            "favoriteMovies": []
        }
        ```
    - **404 Not Found**
        ```json
        {
            "message": "User not found"
        }
        ```

### Update User
- **Endpoint:** `/users/:Username`
- **Method:** `PUT`
- **Description:** Updates user information by username.
- **Request Body:**
    ```json
    {
        "username": "new_username",
        "email": "new_email",
        "dateOfBirth": "YYYY-MM-DD",
        "password": "new_password"
    }
    ```
- **Responses:**
    - **200 OK**
        ```json
        {
            "username": "new_username",
            "email": "new_email",
            ...
        }
        ```
    - **404 Not Found**
        ```json
        {
            "message": "User not found"
        }
        ```

### Delete User
- **Endpoint:** `/users/:Username`
- **Method:** `DELETE`
- **Description:** Deletes a user by username.
- **Responses:**
    - **200 OK**
        ```json
        {
            "message": "User deleted successfully"
        }
        ```
    - **404 Not Found**
        ```json
        {
            "message": "User not found"
        }
        ```

## Movies

### Get All Movies
- **Endpoint:** `/movies`
- **Method:** `GET`
- **Description:** Retrieves a list of all movies.
- **Responses:**
    - **200 OK**
        ```json
        [
            {
                "title": "Movie Title",
                "director": "Director Name",
                ...
            },
            ...
        ]
        ```

### Get Movie by Title
- **Endpoint:** `/movies/:title`
- **Method:** `GET`
- **Description:** Retrieves a movie by its title.
- **Responses:**
    - **200 OK**
        ```json
        {
            "title": "Movie Title",
            "director": "Director Name",
            ...
        }
        ```
    - **404 Not Found**
        ```json
        {
            "message": "Movie not found"
        }
        ```

### Add Movie to User's Favorites
- **Endpoint:** `/users/:Username/movies/:MovieID`
- **Method:** `PATCH`
- **Description:** Adds a movie to a user's favorite movies list.
- **Request Body:**
    ```json
    {
        "MovieID": "movie_id_here"
    }
    ```
- **Responses:**
    - **200 OK**
        ```json
        {
            "favoriteMovies": ["movie_id_here", ...]
        }
        ```

### Delete Movie from User's Favorites
- **Endpoint:** `/users/:Username/movies/:MovieID`
- **Method:** `DELETE`
- **Description:** Removes a movie from a user's favorite movies list.
- **Responses:**
    - **200 OK**
        ```json
        {
            "favoriteMovies": ["remaining_movie_ids"]
        }
        ```

## Error Handling
All endpoints will return appropriate HTTP status codes and error messages for various error conditions.

## Notes
- Ensure you have the JWT secret set in your environment variables for authentication.
- Use tools like Postman or cURL to test the API endpoints.

