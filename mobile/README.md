# Nigehbaan Mobile

This is an Expo mobile app companion for the Nigehbaan elderly care system.

## Setup

1. Install dependencies:
   ```bash
   cd mobile
   npm install
   ```

2. Start the app:
   ```bash
   npm start
   ```

3. Open the app in a simulator or Expo Go.

## Notes

- The mobile app uses `http://localhost:5000/api` on iOS simulators and `http://10.0.2.2:5000/api` on Android emulators.
- If you run on a physical device, update `mobile/services/api.js` to use your PC local IP address:
  ```js
  const BASE_URL = "http://YOUR_PC_IP:5000/api";
  ```
- The app includes:
  - Home screen
  - Login screen
  - Dashboard screen
  - Alerts list screen

## Backend

Make sure the backend is running before using the mobile app.
```bash
cd backend
npm run dev
```
