# WasteWatch AI - Environment Variables Setup

## Backend (.env)
Create a `.env` file in the `backend/` directory with the following:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/wastewatch
JWT_SECRET=your_jwt_secret_key
# Optional for Cloudinary
CLOUDINARY_CLOUD_NAME=your_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
```

## How to Run Locally

### Prerequisites
- Node.js installed
- MongoDB running locally or a MongoDB Atlas URI

### 1. Start Backend
```bash
cd backend
npm install
npm start
```

### 2. Start Frontend
```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.
The backend will run on `http://localhost:5000`.
