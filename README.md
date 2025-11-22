Cilium Policy Advisor - Complete Project Guide
📖 Table of Contents
What This Project Does
How It Works
Project Architecture
File Structure & Purpose
Input Requirements
Step-by-Step Usage
Data Flow Diagram
🎯 What This Project Does
Cilium Policy Advisor (CPA) is a tool that helps Kubernetes administrators create network security policies automatically by analyzing actual network traffic.

Problem it solves:

Writing CiliumNetworkPolicy YAML files manually is complex and error-prone
You need to know exactly which services talk to each other
Policies should follow the principle of least privilege
Solution:

Capture real network traffic from your Kubernetes cluster (Hubble flows)
Analyze the traffic patterns
Automatically generate secure CiliumNetworkPolicy YAML files
🔄 How It Works
Simple Flow:
1. Capture Traffic → 2. Store in Database → 3. Analyze Patterns → 4. Generate Policy YAML
Detailed Process:
Step 1: Data Collection

You provide Kubernetes Hubble flow logs (network traffic data)
These logs show which pods communicate with each other
Data includes: source, destination, ports, protocols, HTTP paths
Step 2: Storage

Flow data is stored in a SQLite database
Backend API manages all database operations
Data is organized for easy querying and analysis
Step 3: Analysis

Python analyzer reads the flow data
Groups flows by source → destination connections
Identifies patterns and consolidates rules
Step 4: Policy Generation

Python script generates CiliumNetworkPolicy YAML
Policy follows least-privilege principles
Only allows the traffic that was actually observed
Step 5: Management

View and edit generated policies in the web UI
Track policy versions over time
Download policies to apply to your cluster
🏗️ Project Architecture
┌─────────────────────────────────────────────────────────┐
│                    USER INTERFACE                        │
│              React Frontend (Port 5173)                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │Dashboard │ │ Traffic  │ │  Policy  │ │ History  │  │
│  │          │ │  Viewer  │ │  Editor  │ │          │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
└─────────────────────┬───────────────────────────────────┘
                      │ HTTP/REST API
                      ▼
┌─────────────────────────────────────────────────────────┐
│                  BACKEND SERVER                          │
│           Node.js + Express (Port 3000)                  │
│  ┌──────────────────────────────────────────────────┐  │
│  │  API Routes: /flows, /policies, /versions        │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Controllers: Handle business logic              │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Models: Database operations                     │  │
│  └──────────────────────────────────────────────────┘  │
└─────────┬───────────────────────────┬───────────────────┘
          │                           │
          │ spawn()                   │ SQL queries
          ▼                           ▼
┌─────────────────────┐    ┌─────────────────────┐
│  PYTHON ANALYZER    │    │   SQLite DATABASE   │
│                     │    │                     │
│  analyze.py         │    │  Tables:            │
│  generate_policy.py │    │  - flows            │
│                     │    │  - policies         │
│  Input: Flow JSON   │    │  - versions         │
│  Output: YAML       │    │                     │
└─────────────────────┘    └─────────────────────┘
📁 File Structure & Purpose
Root Directory
cilium-policy-advisor/
├── README.md                    # Main documentation
├── PROJECT-GUIDE.md            # This file - detailed guide
├── QUICKSTART.md               # Quick start instructions
├── setup.sh / setup.bat        # Installation scripts
├── test-api.bat                # API testing script
└── .gitignore                  # Git ignore rules
Backend Directory (/backend)
Purpose: Node.js API server that handles all requests

backend/
├── server.js                   # Main entry point - starts Express server
├── database.js                 # Database connection & initialization
├── package.json                # Node.js dependencies
├── .env                        # Environment configuration
│
├── routes/                     # API endpoint definitions
│   ├── flows.js               # Routes: POST/GET/DELETE flows
│   ├── policies.js            # Routes: GET/PUT/DELETE policies
│   ├── versions.js            # Routes: GET policy versions
│   └── dashboard.js           # Routes: GET metrics
│
├── controllers/                # Business logic handlers
│   ├── flowController.js      # Handle flow operations
│   ├── policyController.js    # Handle policy operations
│   ├── versionController.js   # Handle version operations
│   ├── dashboardController.js # Calculate metrics
│   └── analyzerController.js  # Trigger Python analyzer
│
└── models/                     # Database operations
    ├── Flow.js                # Flow CRUD operations
    ├── Policy.js              # Policy CRUD operations
    └── Version.js             # Version CRUD operations
Key Files Explained:

server.js: Starts the Express server, loads routes, connects to database
database.js: Creates SQLite connection, initializes tables
analyzerController.js: Spawns Python process to generate policies
Flow.js: Methods to create, read, update, delete flow records
Policy.js: Methods to manage policy records
Version.js: Methods to track policy versions
Analyzer Directory (/analyzer)
Purpose: Python scripts that analyze flows and generate YAML

analyzer/
├── analyze.py                  # Main analyzer - parses flows
├── generate_policy.py          # Generates CiliumNetworkPolicy YAML
├── requirements.txt            # Python dependencies (PyYAML)
├── sample_logs.json           # Example Hubble flow data
└── sample_policy_output.yaml  # Example generated policy
Key Files Explained:

analyze.py:

Reads flow JSON from stdin
Parses Hubble flow format
Groups flows by source→destination
Calls generate_policy.py
Outputs YAML to stdout
generate_policy.py:

Takes grouped flows
Creates CiliumNetworkPolicy structure
Builds endpointSelector, ingress rules
Formats as YAML
Frontend Directory (/my-react-app)
Purpose: React web application for user interface

my-react-app/
├── index.html                  # HTML entry point
├── package.json                # React dependencies
├── vite.config.js             # Vite build configuration
├── .env                        # Frontend environment variables
│
└── src/
    ├── main.jsx               # React entry point
    ├── App.jsx                # Main app component with routing
    ├── App.css                # Global app styles
    ├── index.css              # Global CSS variables
    │
    ├── components/            # React components
    │   ├── Navigation.jsx     # Top navigation bar
    │   ├── Dashboard.jsx      # Dashboard page - shows metrics
    │   ├── TrafficViewer.jsx  # Traffic page - lists flows
    │   ├── YAMLEditor.jsx     # Policy editor page
    │   ├── PolicyHistory.jsx  # Version history page
    │   └── *.css             # Component-specific styles
    │
    └── services/
        └── api.js             # Axios API client - all backend calls
Key Files Explained:

App.jsx: Sets up React Router, defines all page routes
api.js: Contains all API functions (getFlows, generatePolicy, etc.)
Dashboard.jsx: Fetches and displays metrics from backend
TrafficViewer.jsx: Shows flow table, handles policy generation
YAMLEditor.jsx: Displays policies, allows editing
PolicyHistory.jsx: Shows version timeline
Database Directory (/database)
Purpose: Database schema and sample data

database/
├── schema.sql                  # Table definitions
├── sample_flows.sql           # Sample flow data for testing
└── cpa.db                     # SQLite database (created at runtime)
Key Files Explained:

schema.sql: Defines 3 tables (flows, policies, versions)
sample_flows.sql: INSERT statements for 5 test flows
cpa.db: Actual database file (auto-created by backend)
📥 Input Requirements
What Input Does the System Need?
The system needs Kubernetes Hubble flow logs in JSON format.

Input Data Structure:
{
  "timestamp": "2025-11-19T10:30:00Z",
  "source_namespace": "default",
  "source_pod": "frontend-abc123",
  "source_labels": {
    "app": "frontend",
    "version": "v1"
  },
  "destination_namespace": "default",
  "destination_pod": "backend-xyz789",
  "destination_labels": {
    "app": "backend",
    "version": "v1"
  },
  "destination_port": 8080,
  "protocol": "TCP",
  "http_method": "GET",
  "http_path": "/api/users"
}
Required Fields:
✅ timestamp - When the traffic occurred
✅ source_namespace - Source Kubernetes namespace
✅ source_labels - Labels of source pod (used for policy matching)
✅ destination_namespace - Destination namespace
✅ destination_labels - Labels of destination pod (used for policy matching)
Optional Fields:
source_pod - Source pod name (for display only)
destination_pod - Destination pod name (for display only)
destination_port - Port number
protocol - TCP or UDP
http_method - HTTP method (GET, POST, etc.)
http_path - HTTP path (/api/users)
Where to Get This Input:
Option 1: From Real Kubernetes Cluster

# Install Hubble CLI
# Then export flows
hubble observe --output json > flows.json
Option 2: Use Sample Data (For Testing)

# Import sample flows
sqlite3 database/cpa.db < database/sample_flows.sql
Option 3: Create Manually via API

curl -X POST http://localhost:3000/api/flows \
  -H "Content-Type: application/json" \
  -d '{ ... flow data ... }'
🚀 Step-by-Step Usage
Phase 1: Setup (One-time)
Install Dependencies

# Backend
cd backend
npm install

# Frontend
cd my-react-app
npm install react-router-dom axios

# Python
cd analyzer
pip install -r requirements.txt
Configure Environment

# Backend
cd backend
copy .env.example .env

# Frontend
cd my-react-app
copy .env.example .env
Phase 2: Start Services
Start Backend (Terminal 1)

cd backend
node server.js
✅ Backend running on http://localhost:3000

Start Frontend (Terminal 2)

cd my-react-app
npm run dev
✅ Frontend running on http://localhost:5173

Phase 3: Add Flow Data
Method A: Import Sample Data

sqlite3 database/cpa.db < database/sample_flows.sql
Method B: Use API

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
    "protocol": "TCP"
  }'
Phase 4: Use the Web Interface
Open Browser: http://localhost:5173

Dashboard Page (/)

View total flows and policies
See recent activity
Traffic Viewer (/traffic)

See all captured flows in a table
Use filters: Enter namespace (e.g., default) or port (e.g., 8080)
Select flows: Check boxes next to flows you want to analyze
Generate policy: Click "Generate Policy" button
Enter policy name when prompted (e.g., backend-policy)
Policy Editor (/policies)

Click a policy from the list
View the generated YAML
Click "Edit" to modify
Click "Save" and enter change summary
Click "Download" to save YAML file
Policy History (/history)

Select a policy
View all versions
Click a version to see its YAML
Compare different versions
Phase 5: Apply Policy to Kubernetes
Download the YAML from Policy Editor
Apply to cluster:
kubectl apply -f backend-policy.yaml
📊 Data Flow Diagram
Complete Request Flow:
┌─────────────────────────────────────────────────────────────┐
│ 1. USER ADDS FLOW DATA                                      │
│    - Via API: POST /api/flows                               │
│    - Or import SQL file                                     │
└────────────────────────┬────────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. BACKEND STORES IN DATABASE                               │
│    - flowController.createFlow()                            │
│    - Flow.create() → INSERT INTO flows                      │
└────────────────────────┬────────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. USER VIEWS FLOWS IN UI                                   │
│    - TrafficViewer.jsx loads                                │
│    - Calls: api.getFlows()                                  │
│    - Backend: GET /api/flows                                │
│    - Returns: Flow list with pagination                     │
└────────────────────────┬────────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. USER GENERATES POLICY                                    │
│    - User selects flows (checkboxes)                        │
│    - Clicks "Generate Policy" button                        │
│    - Enters policy name in prompt                           │
└────────────────────────┬────────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. FRONTEND SENDS REQUEST                                   │
│    - api.generatePolicy(flowIds, policyName)                │
│    - POST /api/policies/generate                            │
│    - Body: { flow_ids: [...], policy_name: "..." }         │
└────────────────────────┬────────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. BACKEND FETCHES FLOWS                                    │
│    - analyzerController.generatePolicy()                    │
│    - Flow.findByIds(flowIds)                                │
│    - Retrieves flow data from database                      │
└────────────────────────┬────────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 7. BACKEND SPAWNS PYTHON ANALYZER                           │
│    - spawn('python', ['analyzer/analyze.py'])               │
│    - Writes flow JSON to stdin                              │
│    - Waits for stdout (YAML output)                         │
└────────────────────────┬────────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 8. PYTHON ANALYZES FLOWS                                    │
│    - analyze.py reads JSON from stdin                       │
│    - parse_flows() extracts data                            │
│    - group_by_connection() groups by src→dst                │
│    - generate_policy() creates YAML structure               │
│    - Outputs YAML to stdout                                 │
└────────────────────────┬────────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 9. BACKEND STORES POLICY                                    │
│    - Captures Python stdout (YAML)                          │
│    - Policy.create() → INSERT INTO policies                 │
│    - Version.create() → INSERT INTO versions (v1)           │
└────────────────────────┬────────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 10. BACKEND RETURNS RESPONSE                                │
│     - Returns: { policy: { policy_id, yaml_content, ... } }│
└────────────────────────┬────────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 11. FRONTEND SHOWS SUCCESS                                  │
│     - Alert: "Policy generated successfully!"               │
│     - Redirects to: /policies/:id                           │
└────────────────────────┬────────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 12. USER VIEWS/EDITS POLICY                                 │
│     - YAMLEditor.jsx displays policy                        │
│     - User can edit YAML                                    │
│     - User can download YAML file                           │
│     - User can view version history                         │
└─────────────────────────────────────────────────────────────┘
🎓 Summary
What you need to know:

Input: Kubernetes Hubble flow logs (JSON format)
Process: Backend stores flows → Python analyzes → Generates YAML
Output: CiliumNetworkPolicy YAML files
Usage: Web UI to view, generate, edit, and download policies
Key Components:

Backend: Node.js API (handles requests, stores data)
Analyzer: Python scripts (analyzes flows, generates YAML)
Frontend: React UI (user interface)
Database: SQLite (stores flows, policies, versions)
Main Workflow:

Add flow data (via API or import)
View flows in Traffic Viewer
Select flows and generate policy
View/edit policy in Policy Editor
Download and apply to Kubernetes
📞 Need Help?
Check README.md for installation instructions
Check QUICKSTART.md for quick setup
Check database/sample_flows.sql for example data format
Check analyzer/sample_logs.json for example input format
Check analyzer/sample_policy_output.yaml for example output
Common Issues:

No flows showing? → Import sample data first
Backend not starting? → Check if port 3000 is available
Frontend errors? → Make sure react-router-dom and axios are installed
Policy generation fails? → Check Python and PyYAML are installed
