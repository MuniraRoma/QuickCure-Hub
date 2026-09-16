// services/healthRecordService.js
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
};

// Save Health Record (All Metrics)
export const saveHealthRecord = async (data) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/health-records/save`,
      data,
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    console.error('Error saving health record:', error);
    throw error.response?.data || { success: false, message: error.message };
  }
};

// Get Health History
export const getHealthHistory = async (params = {}) => {
  try {
    const { limit = 100, page = 1, startDate, endDate } = params;
    let url = `${API_BASE_URL}/health-records/history?limit=${limit}&page=${page}`;
    if (startDate) url += `&startDate=${startDate}`;
    if (endDate) url += `&endDate=${endDate}`;
    
    const response = await axios.get(url, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error('Error fetching health history:', error);
    throw error.response?.data || { success: false, message: error.message };
  }
};

// Get Health Record by ID
export const getHealthRecordById = async (id) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/health-records/${id}`,
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching health record:', error);
    throw error.response?.data || { success: false, message: error.message };
  }
};

// Get Chart Data for specific metric
export const getChartData = async (metric, limit = 30) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/health-records/chart/data?metric=${metric}&limit=${limit}`,
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching chart data:', error);
    throw error.response?.data || { success: false, message: error.message };
  }
};

// Delete Health Record
export const deleteHealthRecord = async (id) => {
  try {
    const response = await axios.delete(
      `${API_BASE_URL}/health-records/${id}`,
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    console.error('Error deleting health record:', error);
    throw error.response?.data || { success: false, message: error.message };
  }
};

// Get All Available Metrics for Chart
export const getAvailableMetrics = () => {
  return [
    // Basic Information
    { key: 'age', label: 'Age', category: 'Basic Info', color: '#4CAF50' },
    { key: 'height', label: 'Height (cm)', category: 'Basic Info', color: '#66BB6A' },
    { key: 'weight', label: 'Weight (kg)', category: 'Basic Info', color: '#81C784' },
    { key: 'bmi', label: 'BMI', category: 'Basic Info', color: '#388E3C' },
    
    // Vital Signs
    { key: 'bloodPressure.systolic', label: 'Systolic BP', category: 'Vital Signs', color: '#f44336' },
    { key: 'bloodPressure.diastolic', label: 'Diastolic BP', category: 'Vital Signs', color: '#FF5722' },
    { key: 'heartRate', label: 'Heart Rate (bpm)', category: 'Vital Signs', color: '#E91E63' },
    { key: 'temperature', label: 'Temperature (°C)', category: 'Vital Signs', color: '#9C27B0' },
    
    // Diabetes
    { key: 'bloodSugar.fasting', label: 'Fasting Sugar (mg/dL)', category: 'Diabetes', color: '#FF9800' },
    { key: 'bloodSugar.postprandial', label: 'Postprandial Sugar (mg/dL)', category: 'Diabetes', color: '#FFB74D' },
    { key: 'bloodSugar.hba1c', label: 'HbA1c (%)', category: 'Diabetes', color: '#F57C00' },
    
    // Lipid Profile
    { key: 'lipidProfile.totalCholesterol', label: 'Total Cholesterol (mg/dL)', category: 'Lipid Profile', color: '#3F51B5' },
    { key: 'lipidProfile.hdl', label: 'HDL (mg/dL)', category: 'Lipid Profile', color: '#2196F3' },
    { key: 'lipidProfile.ldl', label: 'LDL (mg/dL)', category: 'Lipid Profile', color: '#1976D2' },
    { key: 'lipidProfile.triglycerides', label: 'Triglycerides (mg/dL)', category: 'Lipid Profile', color: '#0D47A1' },
    
    // CBC
    { key: 'cbc.hemoglobin', label: 'Hemoglobin (g/dL)', category: 'CBC', color: '#E91E63' },
    { key: 'cbc.wbc', label: 'WBC (×10³/µL)', category: 'CBC', color: '#F06292' },
    { key: 'cbc.platelets', label: 'Platelets (×10³/µL)', category: 'CBC', color: '#EC407A' },
    { key: 'cbc.rbc', label: 'RBC (×10⁶/µL)', category: 'CBC', color: '#D81B60' },
    
    // Kidney Function
    { key: 'kidneyFunction.creatinine', label: 'Creatinine (mg/dL)', category: 'Kidney', color: '#00BCD4' },
    { key: 'kidneyFunction.bun', label: 'BUN (mg/dL)', category: 'Kidney', color: '#26C6DA' },
    { key: 'kidneyFunction.uricAcid', label: 'Uric Acid (mg/dL)', category: 'Kidney', color: '#4DD0E1' },
    
    // Liver Function
    { key: 'liverFunction.alt', label: 'ALT (U/L)', category: 'Liver', color: '#8BC34A' },
    { key: 'liverFunction.ast', label: 'AST (U/L)', category: 'Liver', color: '#689F38' },
    { key: 'liverFunction.bilirubin', label: 'Bilirubin (mg/dL)', category: 'Liver', color: '#558B2F' },
    { key: 'liverFunction.protein', label: 'Total Protein (g/dL)', category: 'Liver', color: '#33691E' },
    
    // Vitamins
    { key: 'vitamins.vitaminD', label: 'Vitamin D (ng/mL)', category: 'Vitamins', color: '#FF6F00' },
    { key: 'vitamins.vitaminB12', label: 'Vitamin B12 (pg/mL)', category: 'Vitamins', color: '#F57F17' },
    { key: 'vitamins.folate', label: 'Folate (ng/mL)', category: 'Vitamins', color: '#F9A825' },
    
    // Iron Profile
    { key: 'ironProfile.serumIron', label: 'Serum Iron (µg/dL)', category: 'Iron', color: '#FF5722' },
    { key: 'ironProfile.ferritin', label: 'Ferritin (ng/mL)', category: 'Iron', color: '#BF360C' },
    
    // Thyroid
    { key: 'thyroid.tsh', label: 'TSH (µIU/mL)', category: 'Thyroid', color: '#7B1FA2' },
    { key: 'thyroid.t3', label: 'T3 (ng/dL)', category: 'Thyroid', color: '#9C27B0' },
    { key: 'thyroid.t4', label: 'T4 (µg/dL)', category: 'Thyroid', color: '#AB47BC' },
    
    // Lifestyle
    { key: 'lifestyle.sleep', label: 'Sleep (hours)', category: 'Lifestyle', color: '#607D8B' },
  ];
};