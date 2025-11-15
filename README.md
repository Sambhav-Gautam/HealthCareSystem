# Healthcare System - HCL Healthcare Portal

# Team - POSSIBLE

A modern healthcare management system built with microservices architecture, featuring secure patient management, doctor appointments, test results, and administrative capabilities.

## 🏗️ Architecture

```
Frontend (React) → API Gateway → Auth Service + Medical Service → MongoDB
```

**Services:**
- **Frontend**: React + Vite (Port 5173)
- **API Gateway**: Express.js (Port 3000)
- **Auth Service**: Authentication & User Management (Port 5001)
- **Medical Service**: Appointments, Records, Test Results (Port 5002)

## ✨ Features

- 🔐 **Authentication**: JWT-based auth with email verification
- 👤 **Patient Portal**: Book appointments, view test results, manage profile
- 👨‍⚕️ **Doctor Portal**: Manage appointments, upload test results, create referrals
- 👨‍💼 **Admin Dashboard**: User management and system analytics
- 🔒 **Security**: Argon2 hashing, data encryption, rate limiting, audit logs
- 📧 **Notifications**: Email alerts for appointments and test results
- ⏰ **Automated Tasks**: Appointment reminders and daily digests

## 🚀 Quick Start

### Prerequisites

- Node.js (v18+)
- MongoDB (v6+)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd HealthCareSystem-main
   ```

2. **Install dependencies**
   ```bash
   # Frontend
   cd frontend && npm install && cd ..
   
   # Services
   cd microservices/api-gateway && npm install && cd ../..
   cd microservices/auth-service && npm install && cd ../..
   cd microservices/medical-service && npm install && cd ../..
   ```

3. **Configure environment variables**
   
   Copy example files and update with your values:
   ```bash
   cp frontend/env.example.txt frontend/.env
   cp microservices/api-gateway/env.example.txt microservices/api-gateway/.env
   cp microservices/auth-service/env.example.txt microservices/auth-service/.env
   cp microservices/medical-service/env.example.txt microservices/medical-service/.env
   ```

   **Required variables:**
   - MongoDB connection strings
   - JWT secrets (auth-service)
   - Encryption key (medical-service)
   - Email credentials (for notifications)

4. **Start MongoDB**
   ```bash
   # macOS
   brew services start mongodb-community
   
   # Or use MongoDB Atlas connection string
   ```

5. **Run the application**

   **Terminal 1 - API Gateway:**
   ```bash
   cd microservices/api-gateway && npm run dev
   ```

   **Terminal 2 - Auth Service:**
   ```bash
   cd microservices/auth-service && npm run dev
   ```

   **Terminal 3 - Medical Service:**
   ```bash
   cd microservices/medical-service && npm run dev
   ```

   **Terminal 4 - Frontend:**
   ```bash
   cd frontend && npm run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:5173
   - API Gateway: http://localhost:3000

## 🛠️ Tech Stack

**Frontend:** React 19, Vite, Tailwind CSS, React Router, Axios  
**Backend:** Node.js, Express.js, MongoDB, Mongoose  
**Security:** JWT, Argon2, libsodium, Helmet, Rate Limiting  
**Other:** Nodemailer, node-cron

## 📁 Project Structure

```
HealthCareSystem-main/
├── frontend/                 # React frontend
│   └── src/
│       ├── components/      # UI components
│       ├── pages/          # Page components (admin, auth, doctor, patient)
│       ├── services/       # API services
│       └── context/       # React context
│
└── microservices/
    ├── api-gateway/        # Request routing
    ├── auth-service/       # Authentication & user management
    └── medical-service/    # Medical operations & records
```

## 🔌 API Endpoints

**Authentication:** `/api/auth/*` - Register, login, verify email, password reset  
**Patients:** `/api/patients/*` - Profile, appointments, test results  
**Doctors:** `/api/doctors/*` - Profile, appointments, patient records, test uploads  
**Admin:** `/api/admin/*` - User management, system stats  
**Referrals:** `/api/referrals/*` - Doctor-to-doctor referrals  
**Test Recommendations:** `/api/test-recommendations/*` - Test recommendations

See individual service READMEs for detailed API documentation.

## 🔐 Security

- Argon2 password hashing
- JWT authentication with refresh tokens
- libsodium encryption for sensitive data
- Rate limiting (100 req/15min general, 5 req/15min auth)
- XSS and NoSQL injection protection
- Security headers (Helmet.js)
- Audit logging

## 📚 Documentation

- [Frontend README](./frontend/README.md)
- [API Gateway README](./microservices/api-gateway/README.md)
- [Auth Service README](./microservices/auth-service/README.md)
- [Medical Service README](./microservices/medical-service/README.md)

## 🐳 Docker

Each service includes a Dockerfile. Build and run:

```bash
docker build -t api-gateway ./microservices/api-gateway
docker build -t auth-service ./microservices/auth-service
docker build -t medical-service ./microservices/medical-service
```

## 📄 License

MIT

## 👥 Authors

HCL Hackathon IIITD Team- POSSIBLE

---

**Note:** Ensure all security measures are properly configured before production deployment.
