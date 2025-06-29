#!/bin/bash

echo "🚀 Wescriptor Deployment Script"
echo "==============================="

if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8 or higher."
    exit 1
fi

if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16 or higher."
    exit 1
fi

if ! command -v ffmpeg &> /dev/null; then
    echo "❌ FFmpeg is not installed. Please install FFmpeg."
    echo "   macOS: brew install ffmpeg"
    echo "   Ubuntu: sudo apt install ffmpeg"
    exit 1
fi

echo "✅ All prerequisites are installed"
echo ""

echo "📦 Installing backend dependencies..."
cd backend
pip3 install -r requirements.txt
cd ..

echo ""
echo "📦 Installing frontend dependencies..."
cd frontend
npm install

echo ""
echo "🔨 Building frontend..."
npm run build
cd ..

echo ""
echo "✅ Deployment complete!"
echo ""
echo "To start the application, run:"
echo "  cd backend && python3 main.py"
echo ""
echo "The application will be available at http://localhost:8000" 