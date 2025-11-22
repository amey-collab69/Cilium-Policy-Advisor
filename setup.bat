@echo off
echo Setting up Cilium Policy Advisor...

REM Create environment files from examples
echo Creating environment files...
copy backend\.env.example backend\.env
copy my-react-app\.env.example my-react-app\.env

REM Install backend dependencies
echo Installing backend dependencies...
cd backend
call npm install
cd ..

REM Install Python dependencies
echo Installing Python dependencies...
cd analyzer
pip install -r requirements.txt
cd ..

REM Install frontend dependencies
echo Installing frontend dependencies...
cd my-react-app
call npm install
cd ..

echo Setup complete!
echo.
echo To start the application:
echo 1. Start backend:  cd backend ^&^& node server.js
echo 2. Start frontend: cd my-react-app ^&^& npm run dev
echo.
echo Then open http://localhost:5173 in your browser
pause
