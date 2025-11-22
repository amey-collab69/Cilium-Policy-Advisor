#!/bin/bash

echo "🚀 Setting up Cilium Policy Advisor..."

# Create environment files from examples
echo "📝 Creating environment files..."
cp backend/.env.example backend/.env
cp my-react-app/.env.example my-react-app/.env

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install
cd ..

# Install Python dependencies
echo "🐍 Installing Python dependencies..."
cd analyzer
pip install -r requirements.txt
cd ..

# Install frontend dependencies
echo "⚛️  Installing frontend dependencies..."
cd my-react-app
npm install
cd ..

echo "✅ Setup complete!"
echo ""
echo "To start the application:"
echo "1. Start backend:  cd backend && node server.js"
echo "2. Start frontend: cd my-react-app && npm run dev"
echo ""
echo "Then open http://localhost:5173 in your browser"
