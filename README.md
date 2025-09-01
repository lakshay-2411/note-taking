# Note Taking Web App

A full-stack note-taking application built with React, TypeScript, Node.js, and MongoDB.

## Features

- **User Authentication**: Email/OTP and Google OAuth signup/signin
- **Note Management**: Create, read, delete notes
- **JWT Authorization**: Secure API endpoints
- **Input Validation**: Client and server-side validation
- **Real-time Feedback**: Toast notifications for user actions

## Tech Stack

### Frontend
- React 19 with TypeScript
- Tailwind CSS for styling
- React Router for navigation
- React Hook Form with Zod validation
- Axios for API calls
- React Hot Toast for notifications

### Backend
- Node.js with Express and TypeScript
- MongoDB with Mongoose
- JWT for authentication
- Passport.js for Google OAuth
- Nodemailer for email services
- Joi for validation
- bcryptjs for password hashing

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
git clone https://github.com/lakshay-2411/note-taking.git

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Environment Setup

Create a `.env` file in the backend directory with the following variables:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/note-taking-app
JWT_SECRET=secret-jwt-key
GOOGLE_CLIENT_ID=google-client-id
GOOGLE_CLIENT_SECRET=google-client-secret
SESSION_SECRET=session-secret

# Email configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

### 3. Google OAuth Setup (Optional)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to Credentials and create OAuth 2.0 Client ID
5. Add authorized origins: `http://localhost:5000`
6. Add authorized redirect URIs: `http://localhost:5000/api/auth/google/callback`
7. Copy Client ID and Client Secret to your `.env` file

### 4. Email Setup

1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password for your application
3. Use your Gmail address as `EMAIL_USER`
4. Use the App Password as `EMAIL_PASS`

### 5. Start the Application

```bash
# Start backend server (in backend directory)
npm run dev

# Start frontend server (in frontend directory)
npm run dev
```

### 6. Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration with OTP
- `POST /api/auth/login` - User login with OTP
- `POST /api/auth/verify-otp` - Verify OTP
- `POST /api/auth/resend-otp` - Resend OTP
- `GET /api/auth/google` - Google OAuth login
- `GET /api/auth/google/callback` - Google OAuth callback

### User
- `GET /api/user/profile` - Get user profile (protected)

### Notes
- `GET /api/notes` - Get all user notes (protected)
- `POST /api/notes` - Create new note (protected)
- `PUT /api/notes/:id` - Update note (protected)
- `DELETE /api/notes/:id` - Delete note (protected)
- `GET /api/notes/:id` - Get specific note (protected)

## Project Structure

```
note-taking/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.ts
│   │   │   └── passport.ts
│   │   ├── middleware/
│   │   │   └── auth.ts
│   │   ├── models/
│   │   │   ├── User.ts
│   │   │   └── Note.ts
│   │   ├── routes/
│   │   │   ├── auth.ts
│   │   │   ├── notes.ts
│   │   │   └── user.ts
│   │   ├── services/
│   │   │   └── emailService.ts
│   │   ├── utils/
│   │   │   ├── jwt.ts
│   │   │   └── validation.ts
│   │   └── app.ts
│   ├── package.json
│   └── .env
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Logo.tsx
    │   │   ├── CreateNoteModal.tsx
    │   │   ├── ProtectedRoute.tsx
    │   │   └── PublicRoute.tsx
    │   ├── contexts/
    │   │   └── AuthContext.tsx
    │   ├── pages/
    │   │   ├── SignupPage.tsx
    │   │   ├── SigninPage.tsx
    │   │   ├── VerifyOTPPage.tsx
    │   │   └── DashboardPage.tsx
    │   ├── services/
    │   │   └── api.ts
    │   ├── types/
    │   │   └── index.ts
    │   ├── utils/
    │   │   └── validation.ts
    │   ├── App.tsx
    │   └── main.tsx
    └── package.json
```

## Usage

1. **Sign Up**: Enter name, email, and date of birth to receive OTP
2. **Verify OTP**: Enter the 6-digit code sent to your email
3. **Sign In**: Enter email to receive login OTP
4. **Google Auth**: Click "Continue with Google" for quick authentication
5. **Dashboard**: View welcome message and manage notes
6. **Create Notes**: Click "Create Note" to add new notes
7. **Delete Notes**: Click trash icon to delete notes
8. **Sign Out**: Click "Sign Out" to logout

## Security Features

- JWT tokens with expiration
- Password hashing with bcrypt
- Rate limiting on authentication endpoints
- Input validation and sanitization
- CORS configuration
- Secure session management
- OTP expiration (10 minutes)
