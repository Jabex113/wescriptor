#!/bin/bash

echo "🚀 Starting Wescriptor in development mode..."
echo ""

if [ ! -d "backend/venv" ] && [ ! -d "backend/.venv" ]; then
    echo "📦 Creating Python virtual environment..."
    cd backend
    python3 -m venv venv
    source venv/bin/activate || source venv/Scripts/activate
    pip install -r requirements.txt
    cd ..
fi

if [ ! -d "frontend/node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    cd frontend
    npm install
    cd ..
fi

echo "🔧 Starting backend server..."
cd backend
source venv/bin/activate || source venv/Scripts/activate 2>/dev/null || true
python main.py &
BACKEND_PID=$!
cd ..

sleep 5

echo "🎨 Starting frontend development server..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ Wescriptor is running!"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:8000"
echo ""
echo "Press Ctrl+C to stop both servers..."

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT

wait 