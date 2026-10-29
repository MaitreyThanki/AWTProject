# Login Page User Guide
## Inventory Management System

**Audience:** Students and faculty using the application  
**Page:** `/login`  
**API endpoint:** `POST /api/auth/login`

## 1. Purpose

The Login page authenticates an existing student or faculty account before they use the lab inventory application.

## 2. Before you log in

1. Make sure the application is running.
2. Open the frontend URL provided by the project developer (during local development this is usually `http://localhost:5173/login`).
3. Have your registered email address and password ready.
4. Select the role associated with your account. The selected role must match the role stored for that account.

For a local development setup, the backend must also be running on port 5000 and connected to MongoDB.

## 3. Login page fields

| Field | What to enter |
|---|---|
| Role | Select **Student** or **Faculty**. |
| Email | Enter the email address associated with your account. |
| Password | Enter your account password. Characters are masked while typing. |
| Login | Submit the form to authenticate. |

## 4. How to log in

1. Open the Login page.
2. In **Role**, select Student or Faculty.
3. Enter your registered email address.
4. Enter your password.
5. Click **Login** once.
6. Read the message displayed below the button.

When credentials are accepted, the backend returns a JWT and public user details. The frontend stores the token in the browser's local storage and displays a message similar to **Logged in as student** or **Logged in as faculty**.

**Current UI limitation:** the current page does not automatically redirect to the dashboard after login. If you see the success message, authentication succeeded, but dashboard navigation still needs to be implemented or handled separately.

## 5. Demo accounts for local development

If the developer has run `npm run db:seed --workspace server`, the seed script is intended to create these accounts:

| Role | Email | Password |
|---|---|---|
| Admin | `admin@example.edu` | `admin123` |
| Faculty | `faculty.makers@example.edu` | `faculty123` |

**Important:** The current Login page only offers Student and Faculty in its role dropdown. Therefore, the admin demo account cannot be selected on this page as currently implemented. Do not use demo credentials on a production system; change or remove them before deployment.

A student account can be created through the backend registration endpoint, but the current login page does not include a student sign-up link or registration form.

## 6. Common problems

### “Invalid login details”
- Check that the email and password are correct.
- Ensure the selected role matches the account's role (Student or Faculty).
- Confirm the account exists in the MongoDB database.
- If you changed the seed account password or recreated the database, use the current password.

### The page shows “Login failed” or a server error
- Confirm the backend is running.
- Check `http://localhost:5000/health` in your browser. A healthy API should return a JSON response with status `ok`.
- Confirm `server/.env` contains a valid `MONGODB_URI`.
- Check the backend terminal for the actual error.

### Cannot connect to MongoDB
- In PowerShell, run `Get-Service MongoDB`.
- If it is stopped, open PowerShell as Administrator and run `Start-Service MongoDB`.
- In MongoDB Compass, connect to `mongodb://127.0.0.1:27017`.

### Login succeeds but the dashboard does not open
The current frontend stores the token and shows a success message but does not navigate to a role-specific dashboard. This is a known implementation gap, not necessarily an authentication failure.

## 7. Security guidance

- Never share your password or JWT token.
- Do not save real credentials in source code or commit `server/.env` to GitHub.
- Always log out or clear the session on shared computers; the current starter page does not yet provide a complete logout workflow.
- Use a unique, strong password outside local development.
- Demo passwords are for local testing only and must be replaced before deployment.

## 8. Developer reference

On submit, the page sends a JSON request:

```json
{
  "email": "user@example.edu",
  "password": "your-password",
  "role": "student"
}
```

to `POST /api/auth/login`.

On success, the API returns a token and public user information. The frontend stores the token under the local storage key `token`, and the shared Axios client sends it as an `Authorization: Bearer <token>` header on subsequent API calls.

The page's current role selector contains only `student` and `faculty`. Registration, password reset, forced password change, admin OTP, automatic dashboard routing, and a full logout flow are not implemented by this page.
