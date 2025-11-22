import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDatabase } from './database.js';

// Import routes
import flowRoutes from './routes/flows.js';
import policyRoutes from './routes/policies.js';
import versionRoutes from './routes/versions.js';
import dashboardRoutes from './routes/dashboard.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Enable CORS for frontend communication
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Initialize database
await initDatabase();

// API Routes
app.use('/api/flows', flowRoutes);
app.use('/api/policies', policyRoutes);
app.use('/api/versions', versionRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Cilium Policy Advisor API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: {
      code: err.code || 'INTERNAL_ERROR',
      message: err.message || 'An unexpected error occurred',
      details: err.details || null
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: 'Endpoint not found'
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Cilium Policy Advisor Backend running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});
