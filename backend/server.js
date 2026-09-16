// server.js - COMPLETE NODE.JS + FLASK ML API INTEGRATION
// No Proxy Routes - Direct Flask API Calls

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

// 🆕 Scheduler Import
const { initializeScheduler } = require('./utils/scheduler');

const app = express();

// ============================================
// CONFIGURATION
// ============================================

// Flask ML Service URL
const FLASK_ML_URL = process.env.FLASK_ML_URL || 'http://localhost:5001';
const FLASK_ML_API = `${FLASK_ML_URL}/api`;

console.log('========================================');
console.log('🚀 Starting QuickCure Hub Backend Server');
console.log('========================================');
console.log(`📡 Flask ML Service: ${FLASK_ML_URL}`);
console.log(`📡 Flask ML API: ${FLASK_ML_API}`);

// MongoDB URI
const mongoURI = process.env.MONGODB_URI || process.env.MONGO_URI;

if (!mongoURI) {
  console.error('❌ No MongoDB URI found!');
  process.exit(1);
}

console.log('📦 MongoDB URI:', mongoURI.substring(0, 40) + '...');

// ============================================
// CORS Configuration
// ============================================
app.use(cors({
  origin: ['http://localhost:3000', 'http://192.168.0.101:3000', 'http://localhost:3001', 'http://localhost:3002'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============================================
// IMPORT ROUTES
// ============================================
const userRoutes = require('./routes/userRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const adminRoutes = require('./routes/adminRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const patientRoutes = require('./routes/patientRoutes');
const healthRecordsRoutes = require('./routes/healthRecords');

// 🆕 Prescription Routes Import
const prescriptionRoutes = require('./routes/prescriptionRoutes');

// 🆕 Notification Routes Import
const notificationRoutes = require('./routes/notificationRoutes');

// ============================================
// MOUNT ROUTES (Unified Paths)
// ============================================
app.use('/api/user', userRoutes);
app.use('/api/doctor', doctorRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/health-records', healthRecordsRoutes);

// 🆕 Prescription Routes Mount
app.use('/api/prescriptions', prescriptionRoutes);

// 🆕 Notification Routes Mount
app.use('/api/notifications', notificationRoutes);

// ============================================
// 🆕 SCHEDULER INITIALIZE
// ============================================
// Scheduler start করুন (Reminder Service auto start হবে)
initializeScheduler();
console.log('⏰ Scheduler initialized successfully');

// ============================================
// ML ENDPOINTS - Direct Flask Integration
// ============================================

/**
 * Heart Prediction - Direct Flask ML Service Call
 * POST /api/ml/heart/predict
 */
app.post('/api/ml/heart/predict', async (req, res) => {
  try {
    console.log('📊 [Node.js → Flask] Heart Prediction Request:');
    console.log('📊 Request Data:', JSON.stringify(req.body, null, 2));
    
    const response = await axios.post(`${FLASK_ML_API}/ml/heart/predict`, req.body, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': req.headers.authorization || ''
      },
      timeout: 30000
    });
    
    console.log('✅ [Flask] Heart Prediction Response:', response.data);
    
    res.json({
      success: true,
      ...response.data,
      source: 'flask_ml_service'
    });
    
  } catch (error) {
    console.error('❌ [Node.js] Heart Prediction Error:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('❌ Flask ML Service is not running on port 5001!');
      return res.status(503).json({
        success: false,
        error: 'ML Service Unavailable',
        message: 'Flask ML service is not running. Please start the Flask service on port 5001.',
        source: 'node_fallback',
        timestamp: new Date().toISOString()
      });
    }
    
    if (error.response) {
      return res.status(error.response.status).json({
        success: false,
        error: error.response.data.error || error.response.data.message || 'ML Service Error',
        details: error.response.data,
        source: 'flask_error',
        timestamp: new Date().toISOString()
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to get heart prediction',
      message: error.message,
      source: 'node_error',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Stroke Prediction - Direct Flask ML Service Call
 * POST /api/ml/stroke/predict
 */
app.post('/api/ml/stroke/predict', async (req, res) => {
  try {
    console.log('📊 [Node.js → Flask] Stroke Prediction Request:');
    console.log('📊 Request Data:', JSON.stringify(req.body, null, 2));
    
    const response = await axios.post(`${FLASK_ML_API}/ml/stroke/predict`, req.body, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': req.headers.authorization || ''
      },
      timeout: 30000
    });
    
    console.log('✅ [Flask] Stroke Prediction Response:', response.data);
    
    res.json({
      success: true,
      ...response.data,
      source: 'flask_ml_service'
    });
    
  } catch (error) {
    console.error('❌ [Node.js] Stroke Prediction Error:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('❌ Flask ML Service is not running on port 5001!');
      return res.status(503).json({
        success: false,
        error: 'ML Service Unavailable',
        message: 'Flask ML service is not running. Please start the Flask service on port 5001.',
        source: 'node_fallback',
        timestamp: new Date().toISOString()
      });
    }
    
    if (error.response) {
      return res.status(error.response.status).json({
        success: false,
        error: error.response.data.error || error.response.data.message || 'ML Service Error',
        details: error.response.data,
        source: 'flask_error',
        timestamp: new Date().toISOString()
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to get stroke prediction',
      message: error.message,
      source: 'node_error',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Batch Prediction - Direct Flask ML Service Call
 * POST /api/ml/batch/predict
 */
app.post('/api/ml/batch/predict', async (req, res) => {
  try {
    console.log('📊 [Node.js → Flask] Batch Prediction Request');
    
    const response = await axios.post(`${FLASK_ML_API}/ml/batch/predict`, req.body, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': req.headers.authorization || ''
      },
      timeout: 60000
    });
    
    res.json({
      success: true,
      ...response.data,
      source: 'flask_ml_service'
    });
    
  } catch (error) {
    console.error('❌ [Node.js] Batch Prediction Error:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({
        success: false,
        error: 'ML Service Unavailable',
        message: 'Flask ML service is not running.',
        source: 'node_fallback',
        timestamp: new Date().toISOString()
      });
    }
    
    if (error.response) {
      return res.status(error.response.status).json({
        success: false,
        error: error.response.data.error || error.response.data.message || 'ML Service Error',
        source: 'flask_error',
        timestamp: new Date().toISOString()
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to get batch prediction',
      message: error.message,
      source: 'node_error',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * ML Service Status - Check Flask Health
 * GET /api/ml/status
 */
app.get('/api/ml/status', async (req, res) => {
  try {
    const response = await axios.get(`${FLASK_ML_API}/ml/status`, {
      timeout: 5000
    });
    
    res.json({
      success: true,
      flask: {
        status: 'running',
        url: FLASK_ML_URL,
        details: response.data
      },
      node: {
        status: 'running',
        port: 5000
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ [Node.js] ML Status Check Failed:', error.message);
    
    res.json({
      success: false,
      flask: {
        status: 'unavailable',
        url: FLASK_ML_URL,
        error: error.code === 'ECONNREFUSED' ? 'Service not running' : error.message
      },
      node: {
        status: 'running',
        port: 5000
      },
      timestamp: new Date().toISOString()
    });
  }
});

// ============================================
// HEALTH CHECK - Includes ML Service Status
// ============================================
app.get('/api/health', async (req, res) => {
  let mlStatus = 'unknown';
  let mlError = null;
  
  try {
    const mlCheck = await axios.get(`${FLASK_ML_API}/ml/status`, { timeout: 3000 });
    mlStatus = mlCheck.data.status || 'running';
  } catch (error) {
    mlStatus = 'unavailable';
    mlError = error.code === 'ECONNREFUSED' ? 'Flask service not running on port 5001' : error.message;
  }
  
  res.json({
    success: true,
    status: 'OK',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    services: {
      node: {
        status: 'running',
        port: 5000
      },
      flask_ml: {
        status: mlStatus,
        url: FLASK_ML_URL,
        error: mlError
      },
      mongodb: {
        status: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        database: mongoose.connection.db?.databaseName || 'unknown'
      },
      // 🆕 Scheduler Status
      scheduler: {
        status: 'running',
        jobs: ['medicine_reminder', 'followup_reminder', 'appointment_reminder']
      }
    },
    endpoints: {
      user: '/api/user',
      doctor: '/api/doctor',
      admin: '/api/admin',
      appointment: '/api/appointments',
      patients: '/api/patients',
      healthRecords: '/api/health-records',
      prescriptions: '/api/prescriptions',
      notifications: '/api/notifications', // 🆕 Notification Endpoint
      ml: {
        heart: '/api/ml/heart/predict',
        stroke: '/api/ml/stroke/predict',
        batch: '/api/ml/batch/predict',
        status: '/api/ml/status'
      }
    }
  });
});

// ============================================
// ROOT ROUTE
// ============================================
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'QuickCure Hub API Server',
    version: '1.0.0',
    services: {
      node: {
        status: 'running',
        port: 5000
      },
      flask_ml: {
        url: FLASK_ML_URL,
        endpoints: {
          heart: `${FLASK_ML_API}/ml/heart/predict`,
          stroke: `${FLASK_ML_API}/ml/stroke/predict`,
          status: `${FLASK_ML_API}/ml/status`
        }
      },
      // 🆕 Scheduler Status
      scheduler: {
        status: 'running',
        jobs: [
          'medicine_reminder (every minute)',
          'followup_reminder (8:00 AM)',
          'appointment_reminder (9:00 AM)'
        ]
      }
    },
    endpoints: {
      health: '/api/health',
      user: '/api/user',
      doctor: '/api/doctor',
      admin: '/api/admin',
      appointment: '/api/appointments',
      patients: '/api/patients',
      healthRecords: '/api/health-records',
      prescriptions: '/api/prescriptions',
      notifications: '/api/notifications', // 🆕 Notification Endpoint
      ml: {
        heart: '/api/ml/heart/predict',
        stroke: '/api/ml/stroke/predict',
        batch: '/api/ml/batch/predict',
        status: '/api/ml/status'
      }
    }
  });
});

// ============================================
// 404 HANDLER
// ============================================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route ' + req.originalUrl + ' not found',
    method: req.method,
    available_endpoints: [
      '/api/health',
      '/api/user',
      '/api/doctor',
      '/api/admin',
      '/api/appointments',
      '/api/patients',
      '/api/health-records',
      '/api/prescriptions',
      '/api/notifications', // 🆕 Notification Endpoint
      '/api/ml/heart/predict',
      '/api/ml/stroke/predict',
      '/api/ml/batch/predict',
      '/api/ml/status'
    ]
  });
});

// ============================================
// GLOBAL ERROR HANDLER
// ============================================
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err.message);
  console.error('Stack:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// ============================================
// MONGODB CONNECTION
// ============================================
mongoose.connect(mongoURI)
  .then(() => {
    console.log('✅ MongoDB Atlas Connected Successfully!');
    console.log('📦 Database:', mongoose.connection.db.databaseName);
    console.log('========================================');
  })
  .catch((err) => {
    console.error('❌ MongoDB Connection Error:', err.message);
    process.exit(1);
  });

// ============================================
// START SERVER
// ============================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log('========================================');
  console.log('🚀 Server running on port ' + PORT);
  console.log('========================================');
  console.log('📍 Health: http://localhost:' + PORT + '/api/health');
  console.log('');
  console.log('📡 Node.js Endpoints:');
  console.log('   POST /api/user/register');
  console.log('   POST /api/user/login');
  console.log('   GET  /api/user/profile');
  console.log('   PUT  /api/user/profile');
  console.log('   PUT  /api/user/change-password');
  console.log('   POST /api/user/logout');
  console.log('   POST /api/user/refresh-token');
  console.log('');
  console.log('📋 Admin Analytics Endpoints (Newly Added):');
  console.log('   GET /api/admin/analytics/health-records');  // 🆕 New
  console.log('   GET /api/admin/analytics/prescriptions');   // 🆕 New
  console.log('   GET /api/admin/analytics/medicines');       // 🆕 New
  console.log('');
  console.log('📋 Prescription Endpoints:');
  console.log('   POST   /api/prescriptions');
  console.log('   GET    /api/prescriptions/doctor');
  console.log('   GET    /api/prescriptions/patient');
  console.log('   GET    /api/prescriptions/statistics');
  console.log('   GET    /api/prescriptions/doctor/recent');
  console.log('   GET    /api/prescriptions/:id');
  console.log('   PUT    /api/prescriptions/:id');
  console.log('   PATCH  /api/prescriptions/:id/status');
  console.log('   DELETE /api/prescriptions/:id');
  console.log('   GET    /api/prescriptions/:id/download');
  console.log('');
  console.log('🔔 Notification Endpoints:');
  console.log('   GET    /api/notifications');
  console.log('   GET    /api/notifications/unread');
  console.log('   PUT    /api/notifications/:id/read');
  console.log('   PUT    /api/notifications/read-all');
  console.log('   DELETE /api/notifications/:id');
  console.log('');
  console.log('🤖 ML Endpoints (Direct Flask Integration):');
  console.log('   POST /api/ml/heart/predict   → ' + FLASK_ML_API + '/ml/heart/predict');
  console.log('   POST /api/ml/stroke/predict  → ' + FLASK_ML_API + '/ml/stroke/predict');
  console.log('   POST /api/ml/batch/predict   → ' + FLASK_ML_API + '/ml/batch/predict');
  console.log('   GET  /api/ml/status          → ' + FLASK_ML_API + '/ml/status');
  console.log('');
  console.log('⏰ Scheduler Jobs:');
  console.log('   💊 Medicine Reminder: Every minute');
  console.log('   📅 Follow-up Reminder: Daily at 8:00 AM');
  console.log('   📅 Appointment Reminder: Daily at 9:00 AM');
  console.log('');
  console.log('🔗 Flask ML Service: ' + FLASK_ML_URL);
  console.log('========================================');
});

// ============================================
// GRACEFUL SHUTDOWN
// ============================================
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  await mongoose.connection.close();
  console.log('✅ MongoDB connection closed');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  await mongoose.connection.close();
  console.log('✅ MongoDB connection closed');
  process.exit(0);
}); 