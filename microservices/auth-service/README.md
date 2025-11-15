# Auth Service - HCL Healthcare Portal

Authentication microservice handling user registration, login, email verification, and JWT token management.

## Features

- ✅ User registration with email verification (OTP)
- ✅ Argon2 password hashing
- ✅ JWT-based authentication
- ✅ Refresh token rotation
- ✅ Password reset with OTP
- ✅ Rate limiting (5 requests/15 min for auth endpoints)
- ✅ Email notifications via Nodemailer
- ✅ NoSQL injection prevention
- ✅ XSS protection
- ✅ Helmet security headers
- ✅ CORS whitelist

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (separate auth database)
- **Authentication**: JWT, Argon2
- **Email**: Nodemailer (Gmail SMTP)
- **Security**: Helmet, mongo-sanitize, xss-clean, rate-limit

## API Endpoints

### Public Endpoints

- `POST /api/auth/register` - Register new user
- `POST /api/auth/verify-email` - Verify email with 6-digit code
- `POST /api/auth/resend-code` - Resend verification code
- `POST /api/auth/login` - Login user
- `POST /api/auth/forgot-password` - Send password reset code
- `POST /api/auth/reset-password` - Reset password with code
- `POST /api/auth/refresh-token` - Get new access token

### Protected Endpoints

- `GET /api/auth/me` - Get current user info
- `POST /api/auth/logout` - Logout user

### Internal Endpoints (Inter-service)

- `POST /api/auth/verify-token` - Verify JWT token (used by other microservices)

## Environment Variables

See `.env.example` file. Key variables:

```env
PORT=5001
MONGO_URI=mongodb://localhost:27017/hcl_auth_db
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
```

## Running Locally

```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Start development server
npm run dev

# Start production server
npm start
```

## Running with Docker

```bash
# Build image
docker build -t auth-service .

# Run container
docker run -p 5001:5001 --env-file .env auth-service
```

## Health Check

```bash
curl http://localhost:5001/health
```

## Database

Uses separate MongoDB database: `hcl_auth_db`

### Collections:
- `users` - User accounts and authentication data

## Security Features

1. **Argon2 Hashing**: Memory-hard password hashing
2. **Rate Limiting**: 5 requests per 15 minutes for auth endpoints
3. **NoSQL Injection Prevention**: mongo-sanitize middleware
4. **XSS Protection**: xss-clean middleware
5. **Security Headers**: Helmet.js
6. **CORS Whitelist**: Only allowed origins
7. **JWT Rotation**: Refresh tokens rotated regularly
8. **HTTP-only Cookies**: Tokens stored securely

## Inter-Service Communication

Other microservices can verify JWT tokens by calling:

```bash
POST /api/auth/verify-token
{
  "token": "jwt_token_here"
}
```

Response:
```json
{
  "success": true,
  "valid": true,
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "role": "patient"
  }
}
```

## License

MIT

