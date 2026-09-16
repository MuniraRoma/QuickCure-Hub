// routes/healthRecords.js
const express = require('express');
const router = express.Router();
const HealthRecord = require('../models/HealthRecord');
const { protect } = require('../middleware/authMiddleware'); // ✅ সঠিক middleware

// ✅ Save Health Record
router.post('/save', protect, async (req, res) => {
  try {
    const { date, metrics, notes } = req.body;
    
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }
    
    const record = new HealthRecord({
      userId: req.user.id,
      userEmail: req.user.email || 'unknown@email.com',
      date: date || new Date(),
      metrics: metrics || {},
      notes: notes || ""
    });
    
    await record.save();
    
    res.status(201).json({
      success: true,
      message: 'Health record saved successfully',
      data: record
    });
  } catch (error) {
    console.error('Error saving health record:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save health record',
      error: error.message
    });
  }
});

// ✅ Get User Health Records (History)
router.get('/history', protect, async (req, res) => {
  try {
    const { limit = 50, page = 1, startDate, endDate } = req.query;
    
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }
    
    const query = { userId: req.user.id };
    
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const records = await HealthRecord.find(query)
      .sort({ date: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await HealthRecord.countDocuments(query);
    
    res.json({
      success: true,
      data: records,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        total: total,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching health history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch health history',
      error: error.message
    });
  }
});

// ✅ Get Health Records for Chart (Aggregated Data)
router.get('/chart/data', protect, async (req, res) => {
  try {
    const { metric, limit = 30 } = req.query;
    
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }
    
    if (!metric) {
      return res.status(400).json({
        success: false,
        message: 'Metric parameter is required'
      });
    }
    
    const records = await HealthRecord.find({
      userId: req.user.id
    })
    .sort({ date: 1 })
    .limit(parseInt(limit));
    
    // Extract metric values
    const chartData = records.map(record => {
      const metricKeys = metric.split('.');
      let value = record.metrics;
      for (const key of metricKeys) {
        if (value && typeof value === 'object') {
          value = value[key];
        } else {
          value = null;
          break;
        }
      }
      
      return {
        date: record.date,
        value: value !== undefined && value !== null && value !== "" ? parseFloat(value) : null,
        label: record.date ? new Date(record.date).toLocaleDateString() : null
      };
    }).filter(item => item.value !== null && item.label !== null);
    
    res.json({
      success: true,
      data: chartData,
      metric: metric,
      count: chartData.length
    });
  } catch (error) {
    console.error('Error fetching chart data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch chart data',
      error: error.message
    });
  }
});

// ✅ Get Specific Health Record by ID
router.get('/:id', protect, async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }
    
    const record = await HealthRecord.findOne({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Record not found'
      });
    }
    
    res.json({
      success: true,
      data: record
    });
  } catch (error) {
    console.error('Error fetching health record:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch health record',
      error: error.message
    });
  }
});

// ✅ Delete Health Record
router.delete('/:id', protect, async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }
    
    const record = await HealthRecord.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Record not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Record deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting health record:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete record',
      error: error.message
    });
  }
});

module.exports = router;