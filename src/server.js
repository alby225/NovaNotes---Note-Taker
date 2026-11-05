require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoose = require('mongoose');

const connectDB = require('./config/db');
const noteRoutes = require('./routes/noteRoutes');
const errorHandler = require('./middleware/errorHandler');

// Initialize MongoDB Connection
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Utility Middlewares
app.use(
  helmet({
    contentSecurityPolicy: false, // Disabled for seamless CDN icons/fonts and SPA assets
    crossOriginEmbedderPolicy: false,
  })
);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Serve Frontend Static Assets
app.use(express.static(path.join(__dirname, '../public')));

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState;
  const statusMap = {
    0: 'Disconnected',
    1: 'Connected',
    2: 'Connecting',
    3: 'Disconnecting',
  };

  res.status(200).json({
    status: 'ok',
    uptime: `${Math.floor(process.uptime())}s`,
    timestamp: new Date().toISOString(),
    database: {
      status: statusMap[dbStatus] || 'Unknown',
      readyState: dbStatus,
    },
    memoryUsage: {
      rss: `${Math.round(process.memoryUsage().rss / 1024 / 1024)}MB`,
      heapUsed: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
    },
  });
});

// API Routes
app.use('/api/notes', noteRoutes);

// Fallback for SPA routing - serve index.html for non-API GET routes
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api')) {
    return res.sendFile(path.join(__dirname, '../public/index.html'));
  }
  next();
});

// 404 Route Handler for undefined API routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Cannot ${req.method} ${req.originalUrl} - Route Not Found`,
  });
});

// Global Centralized Error Handling Middleware
app.use(errorHandler);

// Start Server
const server = app.listen(PORT, () => {
  console.log('====================================================');
  console.log(`🚀 NovaNotes Running in ${process.env.NODE_ENV || 'development'} mode`);
  console.log(`📍 Web Interface & API: http://localhost:${PORT}`);
  console.log(`🩺 Health Check:         http://localhost:${PORT}/api/health`);
  console.log(`📝 Notes API Endpoint:   http://localhost:${PORT}/api/notes`);
  console.log('====================================================');
});

// Handle Unhandled Promise Rejections & Process Signals
process.on('unhandledRejection', (err) => {
  console.error(`[Unhandled Rejection] Error: ${err.message}`);
  server.close(() => process.exit(1));
});

process.on('SIGINT', async () => {
  console.log('\n[Server Shutdown] Closing HTTP server and MongoDB connection...');
  server.close(async () => {
    await mongoose.connection.close();
    console.log('[Server Shutdown] Clean exit completed.');
    process.exit(0);
  });
});
