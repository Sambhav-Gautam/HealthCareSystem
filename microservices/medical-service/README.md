# Medical Service - HCL Healthcare Portal

Medical microservice handling patient records, doctor management, appointments, test results, referrals, and admin operations.

## Features

- ✅ Patient profile and medical history management
- ✅ Doctor profiles and availability
- ✅ Appointment booking and management
- ✅ Test results upload and viewing
- ✅ Doctor-to-doctor referrals
- ✅ Test recommendations
- ✅ Admin user management
- ✅ libsodium encryption for sensitive data
- ✅ Email notifications (appointments, test results)
- ✅ Audit logging
- ✅ Cron jobs for reminders
- ✅ JWT-based authentication via Auth Service

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (separate medical database)
- **Authentication**: JWT (verified via Auth Service)
- **Encryption**: libsodium-wrappers
- **Email**: Nodemailer (Gmail SMTP)
- **Scheduling**: node-cron
- **Security**: Helmet, mongo-sanitize, xss-clean, rate-limit

## Inter-Service Communication

Medical Service communicates with Auth Service to verify JWT tokens:

```javascript
// Every protected route verifies token with Auth Service
Auth Service <- POST /api/auth/verify-token <- Medical Service
```

## API Endpoints

### Patient Endpoints
- `GET /api/patients/profile` - Get patient profile
- `PUT /api/patients/profile` - Update patient profile
- `GET /api/patients/appointments` - List appointments
- `POST /api/patients/appointments` - Book appointment
- `PUT /api/patients/appointments/:id/cancel` - Cancel appointment
- `GET /api/patients/test-results` - Get test results

### Doctor Endpoints
- `GET /api/doctors/profile` - Get doctor profile
- `PUT /api/doctors/profile` - Update doctor profile
- `GET /api/doctors/appointments` - List appointments
- `GET /api/doctors/appointments/today` - Today's appointments
- `PUT /api/doctors/appointments/:id` - Update consultation
- `GET /api/doctors/patients` - List treated patients
- `GET /api/doctors/patients/:patientId` - View patient history
- `POST /api/doctors/test-results` - Upload test results

### Referral Endpoints
- `POST /api/referrals` - Create referral
- `GET /api/referrals/sent` - Sent referrals
- `GET /api/referrals/received` - Received referrals
- `PUT /api/referrals/:id/status` - Update referral status
- `GET /api/referrals/my-referrals` - Patient's referrals

### Test Recommendation Endpoints
- `POST /api/test-recommendations` - Add test recommendation
- `GET /api/test-recommendations/doctor` - Doctor's recommendations
- `GET /api/test-recommendations/patient` - Patient's recommendations
- `PUT /api/test-recommendations/:id/test-status` - Update test status

### Admin Endpoints
- `GET /api/admin/stats` - System statistics
- `GET /api/admin/users` - List users
- `GET /api/admin/users/:id` - View user details
- `POST /api/admin/users` - Create user
- `PUT /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Delete user
- `GET /api/admin/appointments` - All appointments

## Environment Variables

See `.env.example` file. Key variables:

```env
PORT=5002
MONGO_URI=mongodb://localhost:27017/hcl_medical_db
AUTH_SERVICE_URL=http://localhost:5001
ENCRYPTION_KEY=your_libsodium_key
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
docker build -t medical-service .

# Run container
docker run -p 5002:5002 --env-file .env medical-service
```

## Health Check

```bash
curl http://localhost:5002/health
```

## Database

Uses separate MongoDB database: `hcl_medical_db`

### Collections:
- `patients` - Patient medical profiles
- `doctors` - Doctor profiles and availability
- `appointments` - Appointment bookings
- `testresults` - Test results and reports
- `referrals` - Doctor referrals
- `testrecommendations` - Test recommendations
- `auditlogs` - System audit logs

## Security Features

1. **libsodium Encryption**: Sensitive medical data encrypted at-rest
2. **JWT Verification**: All requests verified with Auth Service
3. **NoSQL Injection Prevention**: mongo-sanitize middleware
4. **XSS Protection**: xss-clean middleware
5. **Security Headers**: Helmet.js
6. **CORS Whitelist**: Only allowed origins
7. **Audit Logging**: All critical actions logged
8. **Rate Limiting**: 100 requests per 15 minutes

## Cron Jobs

- **Daily at 8 AM**: Send appointment reminders
- **Daily at 6 PM**: Send doctor digest emails

## License

MIT

