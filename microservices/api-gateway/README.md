# API Gateway - HCL Healthcare Portal

API Gateway for routing requests to Auth and Medical microservices.

## Features

- ✅ Request routing to microservices
- ✅ Rate limiting
- ✅ CORS handling
- ✅ Cookie forwarding
- ✅ Security headers (Helmet)
- ✅ Error handling
- ✅ Health checks
- ✅ Request logging

## Architecture

```
Frontend (Port 5173)
    ↓
API Gateway (Port 3000)
    ↓
    ├─→ Auth Service (Port 5001)
    │   └─→ MongoDB (hcl_auth_db)
    │
    └─→ Medical Service (Port 5002)
        └─→ MongoDB (hcl_medical_db)
```

## Route Mapping

| Gateway Route | Proxies To | Service |
|--------------|------------|---------|
| `/api/auth/*` | Auth Service (5001) | Authentication |
| `/api/patients/*` | Medical Service (5002) | Patient operations |
| `/api/doctors/*` | Medical Service (5002) | Doctor operations |
| `/api/admin/*` | Medical Service (5002) | Admin operations |
| `/api/referrals/*` | Medical Service (5002) | Referrals |
| `/api/test-recommendations/*` | Medical Service (5002) | Test recommendations |

## Environment Variables

```env
PORT=3000
AUTH_SERVICE_URL=http://localhost:5001
MEDICAL_SERVICE_URL=http://localhost:5002
CORS_ORIGIN=http://localhost:5173
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
docker build -t api-gateway .

# Run container
docker run -p 3000:3000 --env-file .env api-gateway
```

## Health Check

```bash
curl http://localhost:3000/health
```

## Features

### 1. Request Proxying
- Routes requests to appropriate microservices
- Forwards headers and cookies
- Handles service errors gracefully

### 2. Rate Limiting
- 100 requests per 15 minutes per IP
- Prevents API abuse

### 3. Security
- Helmet.js security headers
- CORS whitelist
- Cookie handling

### 4. Error Handling
- Graceful service unavailability
- Structured error responses
- Detailed logging

## Usage Examples

### Register User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!",
    "firstName": "John",
    "lastName": "Doe",
    "role": "patient"
  }'
```

### Get Patient Profile
```bash
curl -X GET http://localhost:3000/api/patients/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Service Communication

API Gateway forwards all requests and responses:

```
Client Request → Gateway → Microservice
Client ← Gateway ← Microservice Response
```

Cookies are automatically forwarded in both directions.

## License

MIT

