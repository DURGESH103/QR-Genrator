# QR Generator Pro - Advanced MERN Stack Application

A complete, feature-rich QR Code Generator web application built with the MERN stack (MongoDB, Express, React, Node.js) featuring modern UI design, user authentication, analytics, and customization options.

## 🚀 Features

### Core Features
- **Multiple QR Types**: URL, Text, WiFi, vCard, File upload
- **User Authentication**: JWT-based signup/login with password reset
- **QR Customization**: Colors, background, logo, frame, shape options
- **Download Options**: PNG, JPG, SVG formats
- **Analytics Dashboard**: Scan tracking, location, device type, date/time
- **Responsive Design**: Mobile-first approach with dark mode
- **Real-time Preview**: Live QR code preview while editing

### Advanced Features
- **Dynamic QR Codes**: Editable links after creation
- **Scan Analytics**: Detailed charts and performance metrics
- **User Dashboard**: Manage all QR codes in one place
- **Search & Filter**: Find QR codes quickly
- **Bulk Operations**: Delete multiple QR codes
- **API Endpoints**: External QR generation support
- **Rate Limiting**: API protection and security
- **Geolocation Tracking**: Scan location analytics

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **qrcode** - QR generation
- **multer** - File uploads
- **geoip-lite** - Location tracking

### Frontend
- **React 18** - UI library
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **Axios** - HTTP client
- **Recharts** - Analytics charts
- **React Color** - Color picker
- **React Toastify** - Notifications
- **Lucide React** - Icons

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- Git

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd QR-Genarator/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the backend directory:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/qr-generator
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   NODE_ENV=development
   FRONTEND_URL=http://localhost:3000
   ```

4. **Start MongoDB**
   ```bash
   # If using local MongoDB
   mongod
   
   # Or use MongoDB Atlas (update MONGODB_URI in .env)
   ```

5. **Run the backend**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd ../frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup (Optional)**
   Create a `.env` file in the frontend directory:
   ```env
   REACT_APP_API_URL=http://localhost:5000/api
   ```

4. **Run the frontend**
   ```bash
   npm start
   ```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5001

## 🚀 Deployment

### Backend Deployment (Railway/Render)

1. **Railway Deployment**
   ```bash
   # Install Railway CLI
   npm install -g @railway/cli
   
   # Login and deploy
   railway login
   railway init
   railway up
   ```

2. **Environment Variables**
   Set these in your deployment platform:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/qr-generator
   JWT_SECRET=your-production-jwt-secret
   NODE_ENV=production
   FRONTEND_URL=https://your-frontend-domain.com
   ```

### Frontend Deployment (Vercel/Netlify)

1. **Vercel Deployment**
   ```bash
   # Install Vercel CLI
   npm install -g vercel
   
   # Deploy
   vercel --prod
   ```

2. **Environment Variables**
   ```
   REACT_APP_API_URL=https://your-backend-domain.com/api
   ```

### Database Setup (MongoDB Atlas)

1. Create a MongoDB Atlas account
2. Create a new cluster
3. Get connection string
4. Update `MONGODB_URI` in environment variables

## 📱 Usage

### Creating QR Codes

1. **Sign up** for a new account or **login**
2. Navigate to **"Create QR"** from the dashboard
3. Choose QR type (URL, Text, WiFi, vCard, File)
4. Fill in the required information
5. Customize colors, size, and margin
6. Preview and download your QR code

### Analytics Dashboard

1. View **total scans**, **active QR codes**, and **recent activity**
2. Analyze **scan trends** with interactive charts
3. See **device breakdown** and **location analytics**
4. Track **top-performing QR codes**

### Managing QR Codes

1. View all QR codes in the **dashboard**
2. **Search and filter** by title or type
3. **Edit** QR code content and customization
4. **Delete** unwanted QR codes
5. **Track performance** with detailed analytics

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### QR Codes
- `POST /api/qr/generate` - Generate new QR code
- `GET /api/qr` - Get user's QR codes
- `GET /api/qr/:id` - Get specific QR code
- `PUT /api/qr/:id` - Update QR code
- `DELETE /api/qr/:id` - Delete QR code
- `POST /api/qr/:id/scan` - Track QR scan

### Analytics
- `GET /api/analytics/dashboard` - Dashboard statistics
- `GET /api/analytics/scans` - Scan analytics
- `GET /api/analytics/qr/:id` - QR-specific analytics

## 🎨 UI/UX Features

- **Modern Design**: Clean, professional SaaS-style interface
- **Dark Mode**: Toggle between light and dark themes
- **Responsive**: Works perfectly on all devices
- **Animations**: Smooth transitions and hover effects
- **Toast Notifications**: User-friendly feedback
- **Loading States**: Skeleton screens and spinners
- **Error Handling**: Graceful error messages

## 🔒 Security Features

- **JWT Authentication**: Secure token-based auth
- **Password Hashing**: bcrypt encryption
- **Rate Limiting**: API protection
- **Input Validation**: Server-side validation
- **CORS Protection**: Cross-origin security
- **Helmet.js**: Security headers

## 📊 Analytics Features

- **Real-time Tracking**: Live scan monitoring
- **Geographic Data**: Country/region analytics
- **Device Analytics**: Mobile/desktop/tablet breakdown
- **Browser Analytics**: Chrome, Firefox, Safari stats
- **Time-based Charts**: Daily, weekly, monthly trends
- **Performance Metrics**: Top-performing QR codes

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email support@qrgeneratorpro.com or join our Slack channel.

## 🙏 Acknowledgments

- QR code generation powered by [qrcode](https://www.npmjs.com/package/qrcode)
- Charts powered by [Recharts](https://recharts.org/)
- Icons by [Lucide](https://lucide.dev/)
- Styling with [Tailwind CSS](https://tailwindcss.com/)

---

**Built with ❤️ using the MERN Stack**