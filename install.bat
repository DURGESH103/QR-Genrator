@echo off
echo ========================================
echo QR Generator Pro - Installation Script
echo ========================================
echo.

echo Installing root dependencies...
npm install
echo.

echo Installing backend dependencies...
cd backend
npm install
cd ..
echo.

echo Installing frontend dependencies...
cd frontend
npm install
cd ..
echo.

echo ========================================
echo Installation completed successfully!
echo ========================================
echo.
echo To start the application:
echo 1. Make sure MongoDB is running
echo 2. Run: npm run dev
echo.
echo Frontend will be available at: http://localhost:3000
echo Backend API will be available at: http://localhost:5001
echo.
pause