# Elderly Care System - Full Stack Setup Guide

## Overview

This is a complete full-stack application for an elderly care monitoring system with:
- **Frontend**: React app with routing and API integration
- **Backend**: Node.js/Express REST API with MongoDB

## Quick Start

### Prerequisites

1. **Node.js** - Download from https://nodejs.org/ (v14+)
2. **MongoDB** - Either:
   - Local: Download from https://www.mongodb.com/try/download/community
   - Cloud: MongoDB Atlas (https://www.mongodb.com/cloud/atlas)
3. **Git** (optional)

### Setup Steps

#### 1. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Configure MongoDB connection
# Edit .env file:
# - Set MONGODB_URI (local: mongodb://localhost:27017/elderly-care)
# - Keep JWT_SECRET or change it for production
```

#### 2. Seed Database (Optional)

```bash
# From backend directory
node seed.js
```

Test credentials:
- Email: john@example.com / Password: password123
- Email: jane@example.com / Password: password123
- Email: admin@example.com / Password: admin123

#### 3. Start Backend Server

```bash
# From backend directory
npm run dev
# Server will run on http://localhost:5000
```

#### 4. Frontend Setup

```bash
# From project root (FYP)
npm install
```

#### 5. Start Frontend Server

```bash
# From project root
npm start
# App will open on http://localhost:3000
```

## Architecture

### Frontend (React)
- **Port**: 3000
- **Key Routes**:
  - `/` - Login page
  - `/dashboard` - Dashboard
  - `/health` - Health data
  - `/alerts` - Alerts
- **Dependencies**: React Router, Axios

### Backend (Express + MongoDB)
- **Port**: 5000
- **Database**: MongoDB
- **Key Features**:
  - JWT Authentication
  - User Management
  - Health Data Tracking
  - Alert System

## API Endpoints

All health and alert endpoints require JWT authentication.

### Authentication
```
POST /api/auth/login
POST /api/auth/register
```

### Health Data
```
GET /api/health              - Get all health data
POST /api/health             - Create health record
GET /api/health/latest       - Get latest health data
```

### Alerts
```
GET /api/alerts              - Get all alerts
POST /api/alerts             - Create alert
PUT /api/alerts/:id/read     - Mark as read
PUT /api/alerts/:id/resolve  - Resolve alert
```

### Health Check
```
GET /api/health-check        - Verify backend is running
```

## File Structure

```
FYP/
├── backend/                  # Express server
│   ├── config/              # Database config
│   ├── controllers/         # Business logic
│   ├── models/              # MongoDB schemas
│   ├── routes/              # API endpoints
│   ├── middleware/          # Auth middleware
│   ├── server.js            # App entry point
│   ├── seed.js              # Database seeding
│   ├── .env                 # Environment config
│   └── package.json
│
├── src/                      # React frontend
│   ├── components/
│   │   ├── Navbar.js
│   │   └── Card.js
│   ├── pages/
│   │   ├── Login.js
│   │   ├── Dashboard.js
│   │   ├── Health.js
│   │   └── Alert.js
│   ├── services/
│   │   └── api.js          # Axios API client
│   ├── App.js
│   └── index.js
│
├── public/                   # Static files
├── package.json              # Frontend dependencies
└── README.md
```

## Troubleshooting

### Backend Won't Start
- Check MongoDB is running
- Verify port 5000 is not in use
- Check `.env` file configuration

### Frontend Can't Connect to Backend
- Verify backend is running on port 5000
- Check browser console for CORS errors
- Verify API base URL in `src/services/api.js`

### Login Failed
- Use seeded test credentials
- Check backend logs for errors
- Verify MongoDB connection

### Database Connection Failed
- For local MongoDB: Start MongoDB service
- For MongoDB Atlas: Check connection string in `.env`
- Verify network access in MongoDB Atlas

## Development Commands

### Backend
```bash
npm install          # Install dependencies
npm run dev         # Start with auto-reload
npm start           # Start production
node seed.js        # Seed database
```

### Frontend
```bash
npm install         # Install dependencies
npm start           # Start dev server
npm build          # Build for production
npm test           # Run tests
```

## Environment Variables

### Backend (.env)
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/elderly-care
JWT_SECRET=your_jwt_secret_key_change_this_in_production
NODE_ENV=development
```

### Frontend
No .env file needed - API base URL configured in `src/services/api.js`

## Production Deployment

1. Update `JWT_SECRET` to a strong random string
2. Change `NODE_ENV` to production
3. Update `MONGODB_URI` to production database
4. Build frontend: `npm run build`
5. Deploy to hosting (Vercel, Heroku, etc.)

## Security Notes

- Always change JWT_SECRET before production
- Use HTTPS in production
- Never commit .env files
- Implement rate limiting for API
- Validate all user inputs
- Use strong passwords for test accounts

## Support

For issues or questions, check:
1. Backend README: `backend/README.md`
2. Browser console for frontend errors
3. Backend logs in terminal
4. MongoDB connection status

## Next Steps

After setup:
1. Test login with seeded credentials
2. View health data and alerts
3. Create new health records
4. Customize frontend UI as needed
5. Add more features to backend as required

Enjoy your Elderly Care System!
