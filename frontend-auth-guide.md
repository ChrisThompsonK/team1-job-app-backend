# Frontend Authentication Guide

This guide explains how to use the new Better Auth session-based authentication endpoints from the frontend.

**Note:** This project uses **Axios** for HTTP requests. Please use Axios instead of fetch for consistency across the codebase.

## Endpoints

### 1. Login
- **POST** `/api/auth/sign-in/email`
- **Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- **Response:**
  - Returns user and session info
  - Sets a `Set-Cookie` header with the session token (`ba_session`)

#### Example (Axios):
```js
import axios from 'axios';

axios.post("/api/auth/sign-in/email", {
  email,
  password
}, {
  withCredentials: true // IMPORTANT: allows cookies to be set
})
  .then(response => {
    // Handle user data
    console.log(response.data);
  })
  .catch(error => {
    // Handle login error
    console.error(error.response.data);
  });
```

- **Note:** Always set `withCredentials: true` in Axios to allow cookies.

### 2. Get Current User
- **GET** `/api/auth/me`
- **Requires:** Session cookie (`ba_session`) sent automatically by browser
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "id": "...",
        "name": "...",
        "email": "...",
        "emailVerified": true,
        "isAdmin": false
      }
    }
  }
  ```

#### Example (Axios):
```js
import axios from 'axios';

axios.get("/api/auth/me", {
  withCredentials: true
})
  .then(response => {
    // Handle user data
    console.log(response.data);
  })
  .catch(error => {
    // Handle authentication error (401)
    console.error('Not authenticated:', error.response.data);
  });
```

## Handling Session Cookies
- The backend sets a `ba_session` cookie on login.
- The browser will send this cookie automatically if you use `withCredentials: true` in Axios.
- No need to manually manage tokens in localStorage.

## Error Handling
- If login fails, you will get a 401 response with an error message.
- If session is missing/expired, `/api/auth/me` returns 401.
- Use Axios `.catch()` blocks to handle errors properly.

## Security Notes
- Cookies are `HttpOnly`, `Secure`, and `SameSite=Lax` for safety.
- Always use HTTPS in production.

## Example Flow
1. User logs in via `/api/auth/sign-in/email` (POST) with Axios
2. Backend sets session cookie
3. Frontend uses `/api/auth/me` (GET) to fetch user info with Axios
4. All protected requests should use `withCredentials: true` in Axios

---
For questions, contact backend team.
