const express = require('express');
const axios = require('axios');
const router = express.Router();

const ML_API_URL = process.env.ML_API_URL || 'http://localhost:5001';

// Heart Prediction
router.post('/heart/predict', async (req, res) => {
    try {
        console.log('📤 Forwarding to ML API:', ML_API_URL);
        console.log('📤 Request Data:', req.body);
        
        const response = await axios.post(`${ML_API_URL}/api/heart/predict`, req.body, {
            timeout: 30000,
            headers: { 'Content-Type': 'application/json' }
        });
        
        console.log('✅ ML Response:', response.data);
        res.json(response.data);
        
    } catch (error) {
        console.error('❌ ML Error Details:');
        console.error('  - Message:', error.message);
        
        if (error.code === 'ECONNREFUSED') {
            console.error('  - Flask server not running on port 5001');
            return res.status(503).json({
                success: false,
                error: 'ML Service is not running. Please start Flask server.',
                details: 'Run: cd ml_api && python app.py'
            });
        }
        
        if (error.response) {
            console.error('  - Status:', error.response.status);
            console.error('  - Data:', error.response.data);
            return res.status(error.response.status).json({
                success: false,
                error: error.response.data?.error || 'ML Service error',
                details: error.response.data
            });
        }
        
        if (error.request) {
            console.error('  - No response received');
            return res.status(503).json({
                success: false,
                error: 'ML Service is not responding',
                details: 'Check if Flask server is running'
            });
        }
        
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            details: error.message
        });
    }
});

// Stroke Prediction
router.post('/stroke/predict', async (req, res) => {
    try {
        console.log('📤 Forwarding to ML API:', ML_API_URL);
        console.log('📤 Request Data:', req.body);
        
        const response = await axios.post(`${ML_API_URL}/api/stroke/predict`, req.body, {
            timeout: 30000,
            headers: { 'Content-Type': 'application/json' }
        });
        
        console.log('✅ ML Response:', response.data);
        res.json(response.data);
        
    } catch (error) {
        console.error('❌ ML Error Details:');
        console.error('  - Message:', error.message);
        
        if (error.code === 'ECONNREFUSED') {
            return res.status(503).json({
                success: false,
                error: 'ML Service is not running. Please start Flask server.',
                details: 'Run: cd ml_api && python app.py'
            });
        }
        
        if (error.response) {
            return res.status(error.response.status).json({
                success: false,
                error: error.response.data?.error || 'ML Service error',
                details: error.response.data
            });
        }
        
        if (error.request) {
            return res.status(503).json({
                success: false,
                error: 'ML Service is not responding',
                details: 'Check if Flask server is running'
            });
        }
        
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            details: error.message
        });
    }
});

// Health Check
router.get('/health', async (req, res) => {
    try {
        const response = await axios.get(`${ML_API_URL}/api/health`, {
            timeout: 5000
        });
        res.json({
            success: true,
            status: 'ML Service is running',
            url: ML_API_URL,
            details: response.data
        });
    } catch (error) {
        res.status(503).json({
            success: false,
            status: 'ML Service is not available',
            error: error.message,
            url: ML_API_URL
        });
    }
});

module.exports = router;