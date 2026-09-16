# 🏥 QuickCure Hub

## AI-Powered Healthcare Management & Disease Prediction Platform

**QuickCure Hub** is a full-stack healthcare management platform that integrates **Artificial Intelligence, Machine Learning, web technologies, database management, appointment systems, prescription management, and healthcare analytics** into a single platform.

The system is designed for **patients, doctors, and administrators**, providing different features and dashboards according to user roles.

QuickCure Hub combines:

* 🤖 Machine Learning-based disease prediction
* 👤 Patient management
* 👨‍⚕️ Doctor management
* 📅 Appointment management
* 💊 Prescription management
* 🩺 Health record management
* ⏰ Medicine reminders
* 📊 Admin analytics
* 💰 Revenue analytics
* 🔐 Authentication and role-based access
* 🗄️ MongoDB database
* 🌐 React.js frontend
* ⚙️ Node.js/Express.js backend
* 🧠 Machine Learning API

---

# 🌐 Project Overview

QuickCure Hub aims to provide a centralized digital healthcare platform where patients can interact with doctors, manage their healthcare information, book appointments, receive prescriptions, and obtain AI-assisted disease predictions based on symptoms.

The system contains three major application components:

```text
┌──────────────────────────────────────────┐
│             QuickCure Hub                │
├──────────────────────────────────────────┤
│                                          │
│  React.js Frontend                       │
│       Port: 3000                         │
│                                          │
│  Node.js / Express.js Backend            │
│       Port: 5000                         │
│                                          │
│  Machine Learning API                    │
│       Port: 5001                         │
│                                          │
│  MongoDB Database                        │
│                                          │
└──────────────────────────────────────────┘
```

---

# ✨ Key Features

## 🤖 AI Disease Prediction

QuickCure Hub provides an AI-assisted disease prediction feature based on user-provided symptoms.

The machine learning component uses multiple classification algorithms:

* Logistic Regression
* Random Forest
* Support Vector Machine (SVM)
* Naive Bayes

### Prediction Workflow

```text
User Symptoms
      ↓
Input Processing
      ↓
Data Preprocessing
      ↓
Feature Extraction
      ↓
Machine Learning Models
      ↓
Disease Prediction
      ↓
ML API
      ↓
React Frontend
      ↓
Prediction Result
      ↓
Healthcare Recommendation
```

The system allows the ML component to operate independently from the main Node.js backend through a dedicated ML API running on **port 5001**.

> **Medical Disclaimer:** The AI prediction feature is intended for educational and decision-support purposes only. It should not be considered a confirmed medical diagnosis or a replacement for professional medical advice.

---

# 🧠 Machine Learning Models

The project implements multiple supervised classification algorithms for disease prediction.

## 1. Logistic Regression

Logistic Regression is used as a classification algorithm to predict disease categories based on symptom-related features.

It provides a relatively interpretable baseline for comparing classification performance.

---

## 2. Random Forest

Random Forest is an ensemble learning algorithm that combines multiple decision trees to perform classification.

It can capture nonlinear relationships between different symptom features.

---

## 3. Support Vector Machine (SVM)

Support Vector Machine is used to identify decision boundaries between different disease classes.

SVM can be effective for high-dimensional feature spaces.

---

## 4. Naive Bayes

Naive Bayes is a probabilistic classification algorithm based on Bayes' theorem.

It provides another classification approach for comparing disease prediction performance.

---

# 🔬 Machine Learning Pipeline

```text
                    Dataset
                       │
                       ▼
                Data Cleaning
                       │
                       ▼
              Data Preprocessing
                       │
                       ▼
               Feature Engineering
                       │
                       ▼
                 Train / Test Split
                       │
          ┌────────────┼────────────┐
          │            │            │
          ▼            ▼            ▼
     Logistic       Random        SVM
    Regression      Forest
          │            │            │
          └────────────┼────────────┘
                       │
                       ▼
                  Naive Bayes
                       │
                       ▼
                Model Evaluation
                       │
                       ▼
              Prediction System
                       │
                       ▼
                    ML API
                       │
                       ▼
                QuickCure Hub
```

---

# 👤 Patient Module

Patients have access to a dedicated healthcare dashboard.

## Patient Features

* User Registration
* User Login
* Patient Profile
* Symptom Submission
* AI Disease Prediction
* Prediction Results
* Health Records
* Doctor Appointment Booking
* Appointment History
* Doctor Consultation
* Prescription Viewing
* Medicine Reminder
* First-Aid Tips
* Healthcare Recommendations
* User Dashboard

---

## Patient Workflow

```text
Register
   ↓
Login
   ↓
Patient Dashboard
   ↓
Enter Symptoms
   ↓
AI Disease Prediction
   ↓
View Prediction Result
   ↓
Book Doctor Appointment
   ↓
Doctor Consultation
   ↓
Prescription
   ↓
Health Record
```

---

# 👨‍⚕️ Doctor Module

Doctors have a dedicated dashboard for managing patients and appointments.

## Doctor Features

* Doctor Dashboard
* Appointment Management
* View Patient Information
* Patient Management
* Patient Health Records
* Doctor Consultation
* Prescription Creation
* Prescription Management
* Appointment Status Management
* Doctor Settings

---

## Doctor Workflow

```text
Doctor Login
      ↓
Doctor Dashboard
      ↓
View Appointments
      ↓
Select Patient
      ↓
Review Patient Information
      ↓
Doctor Consultation
      ↓
Create Prescription
      ↓
Update Patient Information
```

---

# 👨‍💼 Admin Module

The Admin Dashboard provides system-level monitoring and analytics.

## 📊 Admin Analytics

### Appointment Analytics

* Appointment statistics
* Appointment trends
* Appointment charts
* Recent appointments
* Appointment monitoring

### 💰 Revenue Analytics

* Revenue statistics
* Revenue visualization
* Revenue charts

### 🩺 Health Record Analytics

* Health record statistics
* Patient health activity
* Health record analysis

### 💊 Medicine Analytics

* Medicine statistics
* Medicine usage analysis

### 📋 Prescription Analytics

* Prescription statistics
* Prescription analysis

### 👨‍⚕️ Doctor Analytics

* Doctor statistics
* Top doctors
* Doctor activity

### 👤 Patient Analytics

* Patient statistics
* Top patients
* Patient activity

---

# 📅 Appointment Management

The appointment management system connects patients and doctors.

## Appointment Features

* Doctor selection
* Appointment booking
* Appointment status
* Appointment history
* Doctor appointment management
* Patient appointment management
* Recent appointment tracking
* Appointment analytics

### Appointment Workflow

```text
Patient
   ↓
Select Doctor
   ↓
Choose Appointment
   ↓
Submit Request
   ↓
Node.js Backend
   ↓
MongoDB
   ↓
Doctor Dashboard
   ↓
Appointment Management
```

---

# 💊 Prescription Management

Doctors can create and manage prescriptions for patients.

Prescription information may include:

* Patient information
* Doctor information
* Medicine name
* Dosage
* Frequency
* Duration
* Instructions

Patients can access their prescriptions through their dashboard.

---

# 🩺 Health Record Management

QuickCure Hub provides digital health record management for patients.

The system can maintain information related to:

* Patient information
* Health history
* Symptoms
* Medical records
* Doctor consultation
* Prescriptions
* Healthcare activities

---

# ⏰ Medicine Reminder

The medicine reminder module helps users organize their medication schedules.

Features include:

* Medicine name
* Reminder time
* Medication schedule
* Reminder notifications
* Medicine tracking

---

# 💡 First-Aid & Healthcare Information

The platform also provides general healthcare and first-aid information.

Examples include:

* Basic first-aid guidance
* Health tips
* Symptom-related recommendations
* General healthcare suggestions
* Doctor consultation recommendations

---

# 🏗️ System Architecture

```text
                         QUICKCURE HUB
                              │
                              ▼
                  ┌─────────────────────┐
                  │    React.js         │
                  │    Frontend         │
                  │    Port: 3000       │
                  └──────────┬──────────┘
                             │
                    HTTP / REST API
                             │
                             ▼
                  ┌─────────────────────┐
                  │ Node.js + Express.js│
                  │ Backend             │
                  │ Port: 5000          │
                  └──────────┬──────────┘
                             │
                 ┌───────────┴───────────┐
                 │                       │
                 ▼                       ▼
        ┌─────────────────┐     ┌─────────────────┐
        │    MongoDB      │     │     ML API      │
        │    Database     │     │    Port: 5001   │
        └─────────────────┘     └────────┬────────┘
                                         │
                                         ▼
                              ┌─────────────────────┐
                              │ Machine Learning    │
                              │                     │
                              │ Logistic Regression│
                              │ Random Forest       │
                              │ SVM                 │
                              │ Naive Bayes         │
                              └─────────────────────┘
```

---

# 💻 Technology Stack

## Frontend

* **React.js**
* JavaScript
* HTML5
* CSS3
* Axios
* React Context API
* React Components

**Frontend Port:**

```text
3000
```

**Frontend URL:**

```text
http://localhost:3000
```

---

## Backend

* **Node.js**
* **Express.js**
* JavaScript
* REST APIs
* Authentication
* Authorization
* API Integration

**Backend Port:**

```text
5000
```

**Backend URL:**

```text
http://localhost:5000
```

---

## Database

* **MongoDB**
* MongoDB Atlas / MongoDB Server
* MongoDB Compass

MongoDB is used to store application data such as:

* Users
* Patients
* Doctors
* Appointments
* Health Records
* Prescriptions
* Medicines
* Analytics-related data

---

## Machine Learning

* **Python**
* Pandas
* NumPy
* Scikit-learn
* Logistic Regression
* Random Forest
* Support Vector Machine
* Naive Bayes

**ML API Port:**

```text
5001
```

**ML API URL:**

```text
http://localhost:5001
```

---

# 🔌 Service Communication

QuickCure Hub consists of three main services.

```text
                    React.js
                 localhost:3000
                       │
             ┌─────────┴─────────┐
             │                   │
             ▼                   ▼
        Node.js API          ML API
      localhost:5000       localhost:5001
             │                   │
             ▼                   ▼
         MongoDB          ML Prediction Models
```

### Communication Flow

```text
Patient
   ↓
React.js Frontend
   ↓
Node.js Backend
   ↓
MongoDB
```

For disease prediction:

```text
Patient
   ↓
React.js Frontend
   ↓
ML API
   ↓
Machine Learning Model
   ↓
Prediction Result
   ↓
React.js Frontend
```

---

# 📁 Project Structure

```text
QuickCure-Hub/
│
├── frontend/
│   │
│   ├── public/
│   │   ├── Sounds/
│   │   ├── favicon.ico
│   │   ├── index.html
│   │   ├── manifest.json
│   │   └── robots.txt
│   │
│   ├── src/
│   │   │
│   │   ├── api/
│   │   │   ├── adminApi.js
│   │   │   ├── axios.js
│   │   │   ├── doctorApi.js
│   │   │   ├── index.js
│   │   │   └── userApi.js
│   │   │
│   │   ├── components/
│   │   │   ├── Admin/
│   │   │   ├── About.js
│   │   │   ├── AppointmentCard.js
│   │   │   ├── AppointmentFilter.js
│   │   │   ├── Contact.js
│   │   │   ├── DoctorAppointments.js
│   │   │   ├── DoctorConsultation.js
│   │   │   ├── DoctorDashboard.js
│   │   │   ├── DoctorPatients.js
│   │   │   ├── DoctorPrescriptions.js
│   │   │   ├── DoctorSettings.js
│   │   │   ├── FirstAidTips.js
│   │   │   ├── HomePage.js
│   │   │   ├── Login.js
│   │   │   ├── MedicineReminder.js
│   │   │   ├── PatientProfile.js
│   │   │   ├── Register.js
│   │   │   ├── StatusBadge.js
│   │   │   └── UserProfile.js
│   │   │
│   │   ├── Contexts/
│   │   │   └── AppContexts.js
│   │   │
│   │   ├── images/
│   │   │
│   │   ├── services/
│   │   │   ├── appointmentService.js
│   │   │   ├── healthRecordService.js
│   │   │   └── patientService.js
│   │   │
│   │   ├── styles/
│   │   │
│   │   ├── App.js
│   │   ├── App.css
│   │   ├── index.js
│   │   └── index.css
│   │
│   ├── package.json
│   ├── package-lock.json
│   └── .gitignore
│
├── backend/
│   │
│   ├── routes/
│   ├── models/
│   ├── controllers/
│   ├── middleware/
│   ├── config/
│   ├── server.js
│   ├── package.json
│   └── ...
│
├── ml_api/
│   │
│   ├── models/
│   ├── datasets/
│   ├── preprocessing/
│   ├── prediction/
│   ├── app.py
│   └── requirements.txt
│
└── README.md
```

---

# ⚙️ Installation & Setup

## Prerequisites

Install the following before running the project:

* Node.js
* npm
* Python 3.x
* MongoDB
* MongoDB Compass
* Git
* Visual Studio Code

---

# 🚀 1. Clone the Repository

```bash
git clone https://github.com/MuniraRoma/QuickCure-Hub.git
```

Navigate into the project:

```bash
cd QuickCure-Hub
```

---

# 🌐 2. Frontend Setup

Navigate to the frontend:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file if required:

```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_ML_API_URL=http://localhost:5001
```

Start the React application:

```bash
npm start
```

Frontend will run on:

```text
http://localhost:3000
```

---

# ⚙️ 3. Backend Setup

Open a new terminal.

Navigate to:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Configure the backend `.env` file:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

Start the backend:

```bash
npm start
```

Backend API:

```text
http://localhost:5000
```

For development, if Nodemon is configured:

```bash
npm run dev
```

---

# 🤖 4. ML API Setup

Open another terminal.

Navigate to:

```bash
cd ml_api
```

Create a Python virtual environment:

```bash
python -m venv venv
```

Activate the environment on Windows:

```powershell
venv\Scripts\activate
```

Install required packages:

```bash
pip install -r requirements.txt
```

Configure the ML API to use:

```text
Port: 5001
```

Start the ML API using the configured Python application entry point.

ML API:

```text
http://localhost:5001
```

---

# 🗄️ MongoDB Configuration

QuickCure Hub uses MongoDB as its main database.

Example configuration:

```env
MONGODB_URI=mongodb://localhost:27017/quickcurehub
```

For MongoDB Atlas:

```env
MONGODB_URI=your_mongodb_atlas_connection_string
```

The actual connection string should be stored in `.env` and should not be committed to GitHub.

---

# 🔐 Environment Variables

Sensitive information should never be uploaded to GitHub.

Examples of sensitive information include:

* MongoDB connection strings
* Database passwords
* JWT secrets
* API keys
* Authentication credentials

Recommended `.gitignore`:

```gitignore
# Environment files
.env
.env.*
!.env.example

# Node.js
node_modules/

# React build
build/
dist/

# Python
__pycache__/
*.pyc
venv/
.venv/

# Logs
*.log
```

Create an `.env.example` file without real credentials:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
ML_API_URL=http://localhost:5001
```

---

# 🧪 Testing

The application can be tested at multiple levels.

## Frontend Testing

* UI testing
* Component testing
* Form validation
* Authentication testing
* User workflow testing

Run:

```bash
npm test
```

## Backend Testing

Backend APIs can be tested using:

* Postman
* REST API clients
* Integration testing
* Authentication testing

## Machine Learning Testing

ML models can be evaluated using:

* Accuracy
* Precision
* Recall
* F1-Score
* Confusion Matrix

---

# 📊 Model Evaluation

The implemented machine learning models can be evaluated using standard classification metrics.

| Metric           | Purpose                                         |
| ---------------- | ----------------------------------------------- |
| Accuracy         | Measures overall correct predictions            |
| Precision        | Measures correctness of positive predictions    |
| Recall           | Measures how many relevant cases are identified |
| F1-Score         | Combines precision and recall                   |
| Confusion Matrix | Shows prediction distribution across classes    |

Model performance should be reported using the results obtained from the project's actual dataset and test set.

---

# 🔒 Security Considerations

The application should follow appropriate security practices, including:

* Secure authentication
* Password hashing
* JWT-based authentication where applicable
* Role-based authorization
* Input validation
* API validation
* Secure MongoDB configuration
* Environment variable protection
* HTTPS in production
* Proper error handling
* Protection of sensitive patient information

---

# 🚀 Deployment

The project can be deployed as separate services:

```text
Frontend
    ↓
React Hosting

Backend
    ↓
Node.js Hosting

ML API
    ↓
Python API Hosting

Database
    ↓
MongoDB Atlas
```

For production deployment, environment variables should be configured separately for each service.

The frontend should use the deployed backend and ML API URLs instead of:

```text
localhost:5000
localhost:5001
```

---

# 🔮 Future Improvements

Potential future improvements include:

* Real-time video consultation
* Online payment integration
* Mobile application
* Push notifications
* Advanced AI health assistant
* Explainable AI
* Larger and more diverse healthcare datasets
* Improved ML model performance
* Automated ML model retraining
* Cloud-based deployment
* Advanced patient analytics
* Multilingual healthcare assistant
* Real-time doctor-patient communication
* More advanced healthcare recommendation systems

---

# 🩺 Medical Disclaimer

QuickCure Hub is an academic and software development project.

The machine learning system provides **AI-assisted disease predictions based on available input data**. The predictions should not be treated as a confirmed medical diagnosis.

Users should consult a qualified healthcare professional for:

* Medical diagnosis
* Treatment decisions
* Prescription decisions
* Medication advice
* Emergency healthcare

---

# 🎯 Project Objectives

The main objectives of QuickCure Hub are:

1. Develop a centralized healthcare management platform.
2. Provide AI-assisted disease prediction based on symptoms.
3. Integrate multiple machine learning classification algorithms.
4. Connect patients and doctors through appointment management.
5. Digitize health records and prescriptions.
6. Provide medicine reminder functionality.
7. Provide healthcare-related first-aid information.
8. Provide administrative analytics and reporting.
9. Integrate MongoDB for healthcare data management.
10. Demonstrate the integration of full-stack development with machine learning.

---

# 📌 Project Status

**Status: Active Development**

### Current Modules

* ✅ React.js Frontend
* ✅ Node.js Backend
* ✅ MongoDB Database
* ✅ Machine Learning API
* ✅ Logistic Regression
* ✅ Random Forest
* ✅ Support Vector Machine
* ✅ Naive Bayes
* ✅ Patient Management
* ✅ Doctor Management
* ✅ Appointment Management
* ✅ Prescription Management
* ✅ Health Records
* ✅ Medicine Reminder
* ✅ First-Aid Information
* ✅ Doctor Consultation
* ✅ Admin Dashboard
* ✅ Appointment Analytics
* ✅ Health Record Analytics
* ✅ Medicine Analytics
* ✅ Prescription Analytics
* ✅ Revenue Analytics
* ✅ Doctor Analytics
* ✅ Patient Analytics

---

# 📈 Project Architecture Summary

| Component | Technology           |                          Port |
| --------- | -------------------- | ----------------------------: |
| Frontend  | React.js             |                        `3000` |
| Backend   | Node.js + Express.js |                        `5000` |
| ML API    | Python               |                        `5001` |
| Database  | MongoDB              | Default MongoDB configuration |

---

# 👩‍💻 Author

## Munira Roma

**GitHub:** [MuniraRoma](https://github.com/MuniraRoma)

---

# ⭐ QuickCure Hub

### AI-Powered Healthcare Management & Disease Prediction Platform

```text
React.js
    +
Node.js / Express.js
    +
MongoDB
    +
Machine Learning
    │
    ├── Logistic Regression
    ├── Random Forest
    ├── SVM
    └── Naive Bayes
    │
    ▼
Healthcare Management
    │
    ├── Patients
    ├── Doctors
    ├── Appointments
    ├── Prescriptions
    ├── Health Records
    ├── Medicine Reminders
    └── Analytics
```

> **QuickCure Hub** demonstrates the integration of full-stack web development, MongoDB database management, machine learning, healthcare management, and data analytics in a unified platform.
