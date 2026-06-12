# Users API

# hoisted BaseUrl : 
```txt
 https://user-apis-postgres.onrender.com
 ```

REST API built with Node.js, Express, Sequelize, PostgreSQL, JWT, dotenv, cors, Jest, and Supertest.

## Environment

Create a `.env` file in the project root I am aware that this is sensitive information.

```env
DATABASE_URL="postgres://avnadmin:AVNS_2p0w07S2_Mk21y1ONo4@pg-9b357ee-darshankardile42-759f.e.aivencloud.com:26387/defaultdb"
AUTH_EMAIL="admin@example.com"
AUTH_PASSWORD="password123"
PORT="3000"
JWT_SECRET="8o77vtfrd57rd"
```

## Install And Run

```sh
npm install
npm run dev
```

Server URL:

```txt
http://localhost:3000
```

Run tests:

```sh
npm test
```

## Authentication

The API currently uses one admin login from `.env`. Users created in `/users` do not log in with their own password yet.

### Login And Get Token

```http
POST /auth/login
Content-Type: application/json
```

Body:

```json
{
  "email": "admin@example.com",
  "password": "password123"
}
```

Curl:

```sh
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password123"}'
```

Success response:

```json
{
  "token": "JWT_TOKEN_HERE",
  "tokenType": "Bearer"
}
```

Use the token on protected routes:

```http
Authorization: Bearer JWT_TOKEN_HERE
```

The token is signed with `JWT_SECRET` and expires in `1d`.

## Users

User fields:

```json
{
  "id": 1,
  "name": "Alice",
  "email": "alice@example"
}
```

Email validation accepts this format:

```js
/^[^\s@]+@[^\s@]+$/
```

So `alice@example` is valid, and `alice` is invalid.

### Get Users

```http
GET /users
```

Returns users ordered by `id ASC`.

Query parameters:

```txt
limit   number of users to return
offset  number of users to skip
```

Examples:

```http
GET /users?limit=20&offset=0
GET /users?limit=10&offset=10
```

Current default behavior:

```txt
limit  defaults to 20
offset defaults to 0
```

Important: with the current code, `limit=0` becomes `20` because `parseInt(req.query.limit) || 20` treats `0` as false.

Success response:

```json
{
  "data": [
    {
      "id": 1,
      "name": "Alice",
      "email": "alice@example"
    }
  ]
}
```

### Get User By ID

```http
GET /users/:id
```

Example:

```sh
curl http://localhost:3000/users/1
```

Responses:

```txt
200 user found
400 invalid user id
404 user not found
```

### Create User

Protected route. Requires token.

```http
POST /users
Authorization: Bearer JWT_TOKEN_HERE
Content-Type: application/json
```

Body:

```json
{
  "name": "Alice",
  "email": "alice@example"
}
```

Curl:

```sh
curl -X POST http://localhost:3000/users \
  -H "Authorization: Bearer JWT_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"name":"Alice","email":"alice@example"}'
```

Responses:

```txt
201 user created
400 validation failed
401 missing or invalid token
409 email already exists
```

### Update User

Protected route. Requires token.

```http
PUT /users/:id
Authorization: Bearer JWT_TOKEN_HERE
Content-Type: application/json
```

Body can include one or both fields:

```json
{
  "name": "Alice Updated",
  "email": "alice.updated@example"
}
```

Responses:

```txt
200 user updated
400 validation failed or invalid user id
401 missing or invalid token
404 user not found
409 email already exists
```

### Delete User

Protected route. Requires token.

```http
DELETE /users/:id
Authorization: Bearer JWT_TOKEN_HERE
```

Responses:

```txt
204 user deleted
400 invalid user id
401 missing or invalid token
404 user not found
```

## Request Flow

1. Start the server with `npm run dev`.
2. Login with `POST /auth/login`.
3. Copy the returned `token`.
4. Send protected requests with `Authorization: Bearer JWT_TOKEN_HERE`.
5. Use `GET /users?limit=20&offset=0` to read users with Sequelize/PostgreSQL pagination.


