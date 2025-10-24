# Deployment Guide

## 🚀 Quick Deployment Steps

### 1. Backend Deployment (Vercel)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy Backend**
   ```bash
   cd backend
   vercel --prod
   ```

3. **Set Environment Variables in Vercel Dashboard**
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET`: A secure random string
   - `NODE_ENV`: production
   - `FRONTEND_URL`: Your frontend domain

### 2. Frontend Deployment (Vercel/Netlify)

1. **Update API URL**
   - Edit `frontend/.env.production`
   - Set `REACT_APP_API_URL` to your backend URL

2. **Deploy Frontend**
   ```bash
   cd frontend
   vercel --prod
   ```

### 3. Database Setup (MongoDB Atlas)

1. Create MongoDB Atlas account
2. Create new cluster
3. Get connection string
4. Add to backend environment variables

## 🔧 Alternative Deployment Options

### Backend Options:
- **Railway**: `railway up`
- **Render**: Connect GitHub repo
- **Heroku**: `git push heroku main`

### Frontend Options:
- **Netlify**: Drag & drop build folder
- **Vercel**: Connect GitHub repo
- **Firebase Hosting**: `firebase deploy`

## 📝 Environment Variables

### Backend (.env)
```
PORT=5001
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/qr-generator
JWT_SECRET=your-super-secret-jwt-key
NODE_ENV=production
FRONTEND_URL=https://your-frontend-domain.com
```

### Frontend (.env.production)
```
REACT_APP_API_URL=https://your-backend-domain.com/api
```

## 🌐 Live URLs
- **Frontend**: https://your-app.vercel.app
- **Backend**: https://your-api.vercel.app
- **Database**: MongoDB Atlas

## 📱 Post-Deployment Checklist
- [ ] Test user registration/login
- [ ] Test QR code generation
- [ ] Test file uploads
- [ ] Test analytics dashboard
- [ ] Test mobile responsiveness
- [ ] Verify CORS settings
- [ ] Check environment variables