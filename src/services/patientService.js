// frontend/src/services/patientService.js
import axios from "../api/axios";  // ← পাথ ঠিক করুন

// Get all patients for the logged-in doctor
export const getDoctorPatients = () => {
    return axios.get("/patients/doctor");
};

// Get single patient details with appointment history
export const getPatientDetails = (patientId) => {
    return axios.get(`/patients/${patientId}`);
};

// Search patients
export const searchPatients = (query) => {
    return axios.get(`/patients/search?q=${encodeURIComponent(query)}`);
};

// Get patient appointments
export const getPatientAppointments = (patientId) => {
    return axios.get(`/patients/${patientId}/appointments`);
};

// Update patient status
export const updatePatientStatus = (patientId, data) => {
    return axios.put(`/patients/${patientId}/status`, data);
};

// Delete patient
export const deletePatient = (patientId) => {
    return axios.delete(`/patients/${patientId}`);
};

// Get patient statistics
export const getPatientStats = async () => {
    try {
        const response = await getDoctorPatients();
        return response.data.data.stats;
    } catch (error) {
        console.error('Error fetching patient stats:', error);
        throw error;
    }
};