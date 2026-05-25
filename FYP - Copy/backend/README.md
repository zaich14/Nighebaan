# Elderly Care System - Backend API

Complete Node.js/Express backend for the Elderly Care System frontend.

## Features

- **User Authentication** - JWT-based login and registration
- **Health Data Management** - Store and retrieve health metrics (heart rate, blood pressure, temperature, oxygen levels, steps)
- **Alert System** - Create, read, and manage alerts with severity levels
- **MongoDB Integration** - Persistent data storage with Mongoose ODM
- **CORS Enabled** - Supports frontend requests from different origins
- **Password Hashing** - Secure password storage with bcryptjs

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

## Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   
   Edit `.env` file and set your configuration:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/elderly-care
   JWT_SECRET=your_jwt_secret_key_change_this_in_production
   NODE_ENV=development
   ```

   For MongoDB Atlas, use:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/elderly-care
   ```

## Running the Server

### Development mode (with auto-reload):
```bash
npm run dev
```

### Production mode:
```bash
npm start
```

The server will start on `http://localhost:5000`

## Seed Database

To populate the database with test data:

```bash
node seed.js
```

Test credentials created:
- **User:** john@example.com / password123
- **Caregiver:** jane@example.com / password123
- **Admin:** admin@example.com / admin123

## API Endpoints

### Authentication
- **POST** `/api/auth/login` - Login user
  ```json
  {
    "email": "john@example.com",
    "password": "password123"
  }
  ```
  Response: `{ token, user }`

- **POST** `/api/auth/register` - Register new user
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "user"
  }
  ```

### Health Data (requires authentication)
- **GET** `/api/health` - Get health data
  - Query params: `limit=50`, `skip=0`
  - Response: `{ data: [], total, limit, skip }`

- **POST** `/api/health` - Create health record
  ```json
  {
    "heartRate": 72,
    "bloodPressure": { "systolic": 120, "diastolic": 80 },
    "temperature": 37.0,
    "bloodOxygen": 98,
    "steps": 8500,
    "notes": "Optional notes"
  }
  ```

- **GET** `/api/health/latest` - Get latest health data

### Alerts (requires authentication)
- **GET** `/api/alerts` - Get all alerts
  - Query params: `limit=50`, `skip=0`, `unreadOnly=false`
  - Response: `{ data: [], total, limit, skip }`

- **POST** `/api/alerts` - Create alert
  ```json
  {
    "message": "Alert message",
    "type": "health|medication|appointment|emergency|general",
    "severity": "low|medium|high|critical"
  }
  ```

- **PUT** `/api/alerts/:alertId/read` - Mark alert as read

- **PUT** `/api/alerts/:alertId/resolve` - Resolve alert

### Health Check
- **GET** `/api/health-check` - Check if backend is running
  - Response: `{ status, message }`

## Authentication

The backend uses JWT tokens for authentication. Include the token in requests:

```
Authorization: Bearer <token>
```

Tokens expire after 24 hours.

## Database Models

### User
- `name` (String, required)
- `email` (String, required, unique)
- `password` (String, required, hashed)
- `role` (String: user, caregiver, admin)
- `createdAt` (Date)

### HealthData
- `userId` (ObjectId, ref: User)
- `heartRate` (Number, 0-300)
- `bloodPressure` (Object: systolic, diastolic)
- `temperature` (Number, 35-42)
- `bloodOxygen` (Number, 0-100)
- `steps` (Number)
- `notes` (String)
- `createdAt` (Date)

### Alert
- `userId` (ObjectId, ref: User)
- `message` (String, required)
- `type` (String: health, medication, appointment, emergency, general)
- `severity` (String: low, medium, high, critical)
- `isRead` (Boolean)
- `resolvedAt` (Date)
- `createdAt` (Date)

## Project Structure

```
backend/
├── config/
│   └── db.js              # MongoDB connection
├── models/
│   ├── User.js            # User schema
│   ├── HealthData.js      # Health data schema
│   └── Alert.js           # Alert schema
├── controllers/
│   ├── authController.js  # Auth logic
│   ├── healthController.js # Health data logic
│   └── alertController.js # Alert logic
├── routes/
│   ├── authRoutes.js      # Auth endpoints
│   ├── healthRoutes.js    # Health endpoints
│   └── alertRoutes.js     # Alert endpoints
├── middleware/
│   └── auth.js            # JWT verification
├── server.js              # Express app setup
├── seed.js                # Database seeding
├── .env                   # Environment variables
└── package.json           # Dependencies
```

## Error Handling

The API returns appropriate HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not found
- `500` - Server error

## Development Tips

- Check MongoDB is running before starting the server
- Use `npm run dev` for development with automatic reload
- Seed the database for test data
- Check `/api/health-check` to verify the backend is running
- Update `JWT_SECRET` in production to a strong value
- Store sensitive data in `.env` file (never commit to version control)

## Connecting Frontend

Update the frontend API base URL in `src/services/api.js`:

```javascript
const API = axios.create({
  baseURL: "http://localhost:5000/api",
});
```

## License

ISC
