SmartChef - Demo backend (filesystem persistence)
===============================================

How to run (locally)
--------------------

1. Extract the zip and open a terminal inside the folder.
2. Run `npm install` to install dependencies.
3. Run `npm start` to start the server (default port 4000).
4. A demo user is auto-created on first run:
   - email: chef@culinaria.com
   - password: 123456
   - id: user1

API Endpoints (examples)
------------------------

GET /api/users/:id
  - Returns user object (without passwordHash).

POST /api/security/change-password
  - Body: { userId, currentPassword, newPassword }

POST /api/security/toggle-2fa
  - Body: { userId }

DELETE /api/users/:id
  - Deletes user and avatar file.

POST /api/users/:id/avatar
  - Multipart form upload with 'avatar' field. Saves file to /uploads and updates user.picture.

POST /api/auth/login
  - Body: { email, password } -> returns user object if successful.

Notes
-----
- This backend stores data in the local file `/data/users.json`. It's for demo / local testing only.
- When you migrate to production, replace storage with a proper database (MongoDB Atlas, PostgreSQL, etc.).
"# BOM_PITEU_OFICIAL_REPOSITORIO" 
"# BOM_PITEU_OFICIAL_REPOSITORIO" 
"# BOM_PITEU_OFICIAL_REPOSITORIO" 
"# BOM_PITEU_OFICIAL_REPOSITORIO" 
