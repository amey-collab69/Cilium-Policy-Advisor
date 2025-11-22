# Quick Start Guide

## ✅ Setup Complete!

All dependencies have been installed and the backend is running.

## 🚀 Current Status

- ✅ Backend dependencies installed
- ✅ Frontend dependencies installed (react-router-dom, axios)
- ✅ Python dependencies installed (PyYAML)
- ✅ Environment files created
- ✅ Database initialized
- ✅ Backend server running on http://localhost:3000

## 🎯 Next Steps

### 1. Access the Application

The frontend should already be running. If not, open a new terminal and run:

```bash
cd my-react-app
npm run dev
```

Then open your browser to: **http://localhost:5173**

### 2. Test the Backend API

The backend is running on port 3000. You can test it:

```bash
# Health check
curl http://localhost:3000/health

# Get dashboard metrics
curl http://localhost:3000/api/dashboard/metrics

# Get flows
curl http://localhost:3000/api/flows
```

### 3. Add Sample Data (Optional)

To populate the database with sample flows:

```bash
# Using sqlite3 command line (if installed)
sqlite3 database/cpa.db < database/sample_flows.sql

# Or use a SQLite GUI tool to import database/sample_flows.sql
```

### 4. Generate Your First Policy

1. Go to **Traffic Viewer** page
2. If you added sample data, you'll see flows listed
3. Select one or more flows (checkbox)
4. Click **"Generate Policy"** button
5. Enter a policy name
6. View the generated policy in the **Policy Editor**

## 📱 Application Pages

- **Dashboard** (`/`) - Overview metrics and statistics
- **Traffic Viewer** (`/traffic`) - View and filter network flows
- **Policy Editor** (`/policies`) - View and edit generated policies
- **Policy History** (`/history`) - View policy version history

## 🔧 Troubleshooting

### Frontend Issues

If you see import errors, make sure you installed:
```bash
cd my-react-app
npm install react-router-dom axios
```

### Backend Issues

If backend won't start:
```bash
cd backend
npm install
node server.js
```

### Python Analyzer Issues

If policy generation fails:
```bash
cd analyzer
pip install -r requirements.txt
```

## 🛑 Stopping the Application

To stop the backend server:
- Press `Ctrl+C` in the terminal where it's running

To stop the frontend:
- Press `Ctrl+C` in the terminal where Vite is running

## 📝 Creating Test Data Manually

You can also create flows via the API:

```bash
curl -X POST http://localhost:3000/api/flows \
  -H "Content-Type: application/json" \
  -d '{
    "timestamp": "2025-11-19T10:30:00Z",
    "source_namespace": "default",
    "source_pod": "frontend-abc",
    "source_labels": {"app": "frontend"},
    "destination_namespace": "default",
    "destination_pod": "backend-xyz",
    "destination_labels": {"app": "backend"},
    "destination_port": 8080,
    "protocol": "TCP",
    "http_method": "GET",
    "http_path": "/api/users"
  }'
```

## 🎉 You're All Set!

Your Cilium Policy Advisor is ready to use. Start by exploring the dashboard and generating your first network policy!

For more details, see the main [README.md](README.md)
