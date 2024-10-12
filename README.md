# movie_api2
# Update User's Favorite Movies Endpoint Documentation

## Overview
The Update User's Favorite Movies endpoint allows authenticated users to add a movie to their list of favorite movies. It ensures that duplicates are not added to the user's favorites list.

## Endpoint
**PATCH** `/users/:Username/movies/:MovieID`

## Request Headers
- **Authorization**: `Bearer <token>` (JWT token for authentication)

## Request Parameters
- **Username**: The username of the user whose favorites list is being updated, passed as a URL parameter.
- **MovieID**: The ID of the movie to be added to the user's favorites, passed as a URL parameter or in the request body.

## Request Body
The request body can include the following field:

| Field      | Type     | Required | Description                                   |
|------------|----------|----------|-----------------------------------------------|
| `MovieID`  | String   | Yes      | The ID of the movie to be added to favorites. |

## Example Request
```https://movie-api1-fbc239963864.herokuapp.com/users/:Username/movies/:MovieID
{
    "MovieID": "12345abcde"
}
# Delete Movie from User's Favorites Endpoint Documentation

## Overview
The Delete Movie from User's Favorites endpoint allows authenticated users to remove a movie from their list of favorite movies. It verifies the user's identity and ensures that the specified movie is present in the user's favorites before attempting to delete it.

## Endpoint
**DELETE** `/users/:Username/movies/:MovieID`

## Request Headers
- **Authorization**: `Bearer <token>` (JWT token for authentication)

## Request Parameters
- **Username**: The username of the user whose favorites list is being modified, passed as a URL parameter.
- **MovieID**: The ID of the movie to be removed from the user's favorites, passed as a URL parameter.

## Example Request
```https://movie-api1-fbc239963864.herokuapp.com
DELETE /users/michaeljordan/movies/12345abcde HTTP/1.1
Authorization: Bearer <token>
# User Deletion and Movies Retrieval Endpoint Documentation

## Overview
This documentation covers two endpoints: one for deleting a user from the system and another for retrieving a list of movies. Both endpoints require user authentication via JWT.

---

## Delete User Endpoint

### Endpoint
**DELETE** `/users/:Username`

### Request Headers
- **Authorization**: `Bearer <token>` (JWT token for authentication)

### Request Parameters
- **Username**: The username of the user to be deleted, passed as a URL parameter.

### Example Request
```https://movie-api1-fbc239963864.herokuapp.com/users/:Username
DELETE /users/michaeljordan HTTP/1.1
Authorization: Bearer <token>
# Get Movie by Title Endpoint Documentation

## Overview
This endpoint allows clients to retrieve details of a movie based on its title. It uses JWT for authentication and includes input validation to ensure the title is provided and correctly formatted.

---

## Endpoint
**GET** `/movies/:title`

### Request Headers
- **Authorization**: `Bearer <token>` (JWT token for authentication)

### Request Parameters
- **title**: The title of the movie to be retrieved, passed as a URL parameter.

### Example Request
```https://movie-api1-fbc239963864.herokuapp.com/movies/:title
GET /movies/Inception HTTP/1.1
Authorization: Bearer <token>
# Get Movies by Genre Endpoint Documentation

## Overview
This endpoint allows clients to retrieve a list of movies that belong to a specified genre. It uses JWT for authentication and provides case-insensitive searching through regex.

---

## Endpoint
**GET** `/movies/genre/:genreName`

### Request Headers
- **Authorization**: `Bearer <token>` (JWT token for authentication)

### Request Parameters
- **genreName**: The name of the genre to filter movies by, passed as a URL parameter.

### Example Request
```https://movie-api1-fbc239963864.herokuapp.com/movies/genre/:genreName
GET /movies/genre/Action HTTP/1.1
Authorization: Bearer <token>
# Get Movies by Director Endpoint Documentation

## Overview
This endpoint allows clients to retrieve a list of movies directed by a specified director. It utilizes JWT for authentication and performs case-insensitive searching through regex.

---

## Endpoint
**GET** `/movies/director/:directorName`

### Request Headers
- **Authorization**: `Bearer <token>` (JWT token for authentication)

### Request Parameters
- **directorName**: The name of the director to filter movies by, passed as a URL parameter.

### Example Request
```https://movie-api1-fbc239963864.herokuapp.com/movies/director/:directorName
GET /movies/director/Christopher%20Nolan HTTP/1.1
Authorization: Bearer <token>
# Get All Users Endpoint Documentation

## Overview
This endpoint allows clients to retrieve a list of all users in the system. It fetches user data from the database and returns it as a JSON response.

---

## Endpoint
**GET** `/users`

### Request Headers
- **Content-Type**: `application/json` (optional, as it does not affect the response)

### Example Request
```https://movie-api1-fbc239963864.herokuapp.com/users
GET /users HTTP/1.1
# User Retrieval and Deletion Endpoint Documentation

## Overview
This section documents two endpoints: one for retrieving a user by username and another for deleting a user from the system.

---

## Get User by Username Endpoint

### Endpoint
**GET** `/users/:Username`

#### Request Headers
- **Authorization**: `Bearer <token>` (JWT token for authentication)

### Example Request
```https://movie-api1-fbc239963864.herokuapp.com/users/:Username
GET /users/michaeljordan HTTP/1.1
Authorization: Bearer <your_jwt_token>
