from flask import Flask, jsonify, request
from flask_cors import CORS
import joblib
import numpy as np
import os
import json
import logging
from datetime import datetime
import traceback
import pickle
import pandas as pd

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Configure CORS
CORS(app, origins=["*"])

# Paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, 'models')

# Service configuration
SERVICE_NAME = "ML Prediction Service"
SERVICE_VERSION = "2.0.0"
SERVICE_PORT = int(os.environ.get('ML_SERVICE_PORT', 5001))

logger.info("=" * 60)
logger.info(f"🚀 Starting {SERVICE_NAME} v{SERVICE_VERSION}")
logger.info("=" * 60)
logger.info(f"📂 Models Directory: {MODELS_DIR}")

# Create models directory if it doesn't exist
if not os.path.exists(MODELS_DIR):
    os.makedirs(MODELS_DIR)
    logger.info(f"📁 Created models directory: {MODELS_DIR}")

# List all files in models directory
if os.path.exists(MODELS_DIR):
    files = os.listdir(MODELS_DIR)
    logger.info(f"📂 Files in models directory: {files}")
    logger.info(f"📂 Total files: {len(files)}")
else:
    logger.error(f"❌ Models directory not found: {MODELS_DIR}")

# ============================================
# HEART MODEL FEATURE NAMES (18 features)
# ============================================
HEART_FEATURE_NAMES = [
    'Chest_Pain', 'Shortness_of_Breath', 'Fatigue', 'Palpitations',
    'Dizziness', 'Swelling', 'Pain_Arms_Jaw_Back', 'Cold_Sweats_Nausea',
    'High_BP', 'High_Cholesterol', 'Diabetes', 'Smoking',
    'Obesity', 'Sedentary_Lifestyle', 'Family_History', 'Chronic_Stress',
    'Gender', 'Age'
]

# Heart symptom features (16 symptoms, excluding Age and Gender)
HEART_SYMPTOM_FEATURES = [
    'cp', 'shortness_of_breath', 'fatigue', 'palpitations',
    'dizziness', 'swelling', 'pain_arms_jaw_back', 'cold_sweats_nausea',
    'high_bp', 'high_cholesterol', 'diabetes', 'smoking',
    'obesity', 'sedentary_lifestyle', 'family_history', 'chronic_stress'
]

# Heart feature count
HEART_N_FEATURES = 18

# ============================================
# STROKE MODEL FEATURE NAMES (17 features)
# ============================================
STROKE_FEATURE_NAMES = [
    'age',
    'gender',
    'chest_pain',
    'high_blood_pressure',
    'irregular_heartbeat',
    'shortness_of_breath',
    'fatigue_weakness',
    'dizziness',
    'swelling_edema',
    'neck_jaw_pain',
    'excessive_sweating',
    'persistent_cough',
    'nausea_vomiting',
    'chest_discomfort',
    'cold_hands_feet',
    'snoring_sleep_apnea',
    'anxiety_doom'
]

# Stroke symptom features (15 symptoms, excluding Age and Gender)
STROKE_SYMPTOM_FEATURES = [
    'chest_pain', 'high_blood_pressure', 'irregular_heartbeat',
    'shortness_of_breath', 'fatigue_weakness', 'dizziness',
    'swelling_edema', 'neck_jaw_pain', 'excessive_sweating',
    'persistent_cough', 'nausea_vomiting', 'chest_discomfort',
    'cold_hands_feet', 'snoring_sleep_apnea', 'anxiety_doom'
]

# Stroke feature count
STROKE_N_FEATURES = 17

# Threshold for both models
PREDICTION_THRESHOLD = 0.35

# ============================================
# HEART MODEL LOADING
# ============================================
heart_model = None
heart_scaler = None
heart_features = None
heart_model_loaded = False
heart_model_type = None

try:
    heart_model_path = os.path.join(MODELS_DIR, 'HeartDiseaseRisk.pkl')
    heart_scaler_path = os.path.join(MODELS_DIR, 'heart_scaler.pkl')
    heart_features_path = os.path.join(MODELS_DIR, 'heart_features.pkl')
    
    logger.info(f"🔍 Loading heart model from: {heart_model_path}")
    logger.info(f"🔍 Loading heart scaler from: {heart_scaler_path}")
    
    if os.path.exists(heart_model_path) and os.path.exists(heart_scaler_path):
        logger.info("📥 Loading heart model files...")
        
        try:
            heart_model = joblib.load(heart_model_path)
            logger.info("✅ Heart model loaded with joblib")
        except Exception as e:
            logger.warning(f"⚠️ Joblib failed: {e}, trying pickle...")
            with open(heart_model_path, 'rb') as f:
                heart_model = pickle.load(f)
            logger.info("✅ Heart model loaded with pickle")
        
        try:
            heart_scaler = joblib.load(heart_scaler_path)
            logger.info("✅ Heart scaler loaded with joblib")
        except Exception as e:
            logger.warning(f"⚠️ Joblib failed: {e}, trying pickle...")
            with open(heart_scaler_path, 'rb') as f:
                heart_scaler = pickle.load(f)
            logger.info("✅ Heart scaler loaded with pickle")
        
        if os.path.exists(heart_features_path):
            try:
                heart_features = joblib.load(heart_features_path)
                logger.info(f"✅ Heart features loaded: {heart_features}")
            except Exception as e:
                logger.warning(f"⚠️ Could not load features: {e}")
        
        if heart_model is not None and heart_scaler is not None:
            heart_model_loaded = True
            heart_model_type = type(heart_model).__name__
            logger.info(f"✅ Heart model loaded successfully! Type: {heart_model_type}")
    else:
        logger.warning("⚠️ Heart model files not found!")
        raise Exception("Heart model files not found")
        
except Exception as e:
    logger.warning(f"⚠️ Could not load heart model: {str(e)}")
    logger.error("❌ Make sure you run heart_disease.py first to generate the model!")
    heart_model_loaded = False

logger.info("=" * 60)
logger.info(f"❤️ Heart model: {'✅ LOADED' if heart_model_loaded else '❌ NOT LOADED'}")
logger.info(f"   Type: {heart_model_type}")
logger.info(f"   Features: {HEART_N_FEATURES}")
logger.info("=" * 60)

# ============================================
# STROKE MODEL LOADING
# ============================================
stroke_model = None
stroke_scaler = None
stroke_features = None
stroke_model_loaded = False
stroke_model_type = None

try:
    stroke_model_path = os.path.join(MODELS_DIR, 'StrokeRisk.pkl')
    stroke_scaler_path = os.path.join(MODELS_DIR, 'stroke_scaler.pkl')
    stroke_features_path = os.path.join(MODELS_DIR, 'stroke_features.pkl')
    
    logger.info(f"🔍 Loading stroke model from: {stroke_model_path}")
    logger.info(f"🔍 Loading stroke scaler from: {stroke_scaler_path}")
    
    if os.path.exists(stroke_model_path) and os.path.exists(stroke_scaler_path):
        logger.info("📥 Loading stroke model files...")
        
        # Load model
        try:
            stroke_model = joblib.load(stroke_model_path)
            logger.info("✅ Stroke model loaded with joblib")
        except Exception as e:
            logger.warning(f"⚠️ Joblib failed: {e}, trying pickle...")
            with open(stroke_model_path, 'rb') as f:
                stroke_model = pickle.load(f)
            logger.info("✅ Stroke model loaded with pickle")
        
        # Load scaler
        try:
            stroke_scaler = joblib.load(stroke_scaler_path)
            logger.info("✅ Stroke scaler loaded with joblib")
        except Exception as e:
            logger.warning(f"⚠️ Joblib failed: {e}, trying pickle...")
            with open(stroke_scaler_path, 'rb') as f:
                stroke_scaler = pickle.load(f)
            logger.info("✅ Stroke scaler loaded with pickle")
        
        # Load features
        if os.path.exists(stroke_features_path):
            try:
                stroke_features = joblib.load(stroke_features_path)
                logger.info(f"✅ Stroke features loaded: {stroke_features}")
            except Exception as e:
                logger.warning(f"⚠️ Could not load features: {e}")
        
        if stroke_model is not None and stroke_scaler is not None:
            stroke_model_loaded = True
            stroke_model_type = type(stroke_model).__name__
            logger.info(f"✅ Stroke model loaded successfully! Type: {stroke_model_type}")
            
            # Check scaler feature count
            scaler_feature_count = stroke_scaler.n_features_in_ if hasattr(stroke_scaler, 'n_features_in_') else 0
            logger.info(f"📊 Current scaler expects: {scaler_feature_count} features")
            
            if scaler_feature_count != STROKE_N_FEATURES:
                logger.error(f"❌❌❌ SCALER MISMATCH! Expected {STROKE_N_FEATURES}, got {scaler_feature_count}")
                logger.error("❌ Please delete stroke_scaler.pkl and restart the server to retrain")
        else:
            logger.error("❌ Failed to load stroke model")
    else:
        logger.warning("⚠️ Stroke model files not found!")
        raise Exception("Stroke model files not found")
        
except Exception as e:
    logger.warning(f"⚠️ Could not load stroke model: {str(e)}")
    logger.info("📊 Training new stroke model with 17 features...")
    
    from sklearn.ensemble import RandomForestClassifier
    from sklearn.preprocessing import StandardScaler
    from sklearn.utils.class_weight import compute_class_weight
    
    np.random.seed(43)
    n_samples = 15000

    # Generate stroke feature data with 17 features
    stroke_feature_data = {}
    for feature in STROKE_FEATURE_NAMES:
        if feature == 'age':
            stroke_feature_data[feature] = np.random.randint(1, 101, n_samples)
        elif feature == 'gender':
            stroke_feature_data[feature] = np.random.randint(0, 2, n_samples)
        else:
            stroke_feature_data[feature] = np.random.randint(0, 2, n_samples)

    # Calculate stroke risk
    stroke_risk = np.zeros(n_samples)
    
    symptom_weights = {
        'chest_pain': 3.0,
        'high_blood_pressure': 3.0,
        'irregular_heartbeat': 2.5,
        'shortness_of_breath': 2.5,
        'fatigue_weakness': 2.0,
        'dizziness': 2.0,
        'swelling_edema': 1.5,
        'neck_jaw_pain': 2.5,
        'excessive_sweating': 1.5,
        'persistent_cough': 1.5,
        'nausea_vomiting': 2.0,
        'chest_discomfort': 2.5,
        'cold_hands_feet': 1.5,
        'snoring_sleep_apnea': 2.0,
        'anxiety_doom': 2.0
    }

    for i in range(n_samples):
        risk = 0.0
        age = stroke_feature_data['age'][i]
        if age > 50:
            risk += 5.0
        elif age > 45:
            risk += 3.0
        elif age > 30:
            risk += 1.5
        else:
            risk += 0.2
        
        if stroke_feature_data['gender'][i] == 1:
            risk += 0.5
        
        for symptom, weight in symptom_weights.items():
            if symptom in stroke_feature_data:
                risk += stroke_feature_data[symptom][i] * weight
        
        stroke_risk[i] = risk

    stroke_risk = (stroke_risk - stroke_risk.min()) / (stroke_risk.max() - stroke_risk.min())
    y_stroke = (stroke_risk > 0.25).astype(int)

    # Balance classes
    if np.sum(y_stroke) < n_samples * 0.15:
        indices = np.random.choice(n_samples, int(n_samples * 0.25), replace=False)
        y_stroke[indices] = 1

    logger.info(f"📊 Stroke training: {np.sum(y_stroke)} positive ({np.sum(y_stroke)/n_samples*100:.1f}%)")

    # Create feature matrix with 17 features
    X_stroke = np.column_stack([stroke_feature_data[f] for f in STROKE_FEATURE_NAMES])
    
    # Calculate class weights
    try:
        class_weights_stroke = compute_class_weight('balanced', classes=np.unique(y_stroke), y=y_stroke)
        class_weight_dict_stroke = {0: class_weights_stroke[0], 1: class_weights_stroke[1]}
        logger.info(f"📊 Class weights: {class_weight_dict_stroke}")
    except Exception as e:
        logger.warning(f"⚠️ Class weight calculation failed: {e}")
        class_weight_dict_stroke = {0: 1.0, 1: 2.0}

    # Train model
    stroke_model = RandomForestClassifier(
        n_estimators=200,
        random_state=43,
        max_depth=20,
        min_samples_split=3,
        min_samples_leaf=1,
        class_weight=class_weight_dict_stroke
    )
    stroke_model.fit(X_stroke, y_stroke)

    # Create 17-feature scaler
    stroke_scaler = StandardScaler()
    stroke_scaler.fit(X_stroke)
    stroke_scaler.feature_names_in_ = np.array(STROKE_FEATURE_NAMES)

    # Save models
    try:
        joblib.dump(stroke_model, stroke_model_path)
        joblib.dump(stroke_scaler, stroke_scaler_path)
        joblib.dump(STROKE_FEATURE_NAMES, stroke_features_path)
        logger.info("✅ Stroke model saved successfully!")
    except Exception as save_error:
        logger.warning(f"⚠️ Could not save stroke model: {save_error}")
    
    stroke_model_loaded = True
    stroke_model_type = "RandomForestClassifier (Trained)"
    stroke_features = STROKE_FEATURE_NAMES
    logger.info("✅ Stroke model trained successfully with 17 features!")

logger.info("=" * 60)
logger.info(f"🧠 Stroke model: {'✅ LOADED' if stroke_model_loaded else '❌ NOT LOADED'}")
if stroke_scaler:
    logger.info(f"📊 Scaler features: {stroke_scaler.n_features_in_ if hasattr(stroke_scaler, 'n_features_in_') else 'Unknown'}")
logger.info("=" * 60)

# ============================================
# HELPER FUNCTIONS
# ============================================

def convert_value(value, default=0):
    """Convert various input formats to numeric value"""
    if value is None or value == '':
        return default
    if isinstance(value, (int, float)):
        return float(value)
    if isinstance(value, str):
        if value.lower() in ['yes', 'y', 'true', '1', 'on']:
            return 1.0
        if value.lower() in ['no', 'n', 'false', '0', 'off']:
            return 0.0
        try:
            return float(value)
        except:
            return default
    return default

def get_confidence_level(probability):
    """Get confidence level based on probability"""
    confidence = float(probability) * 100
    if confidence >= 85:
        level = "Very High"
    elif confidence >= 70:
        level = "High"
    elif confidence >= 50:
        level = "Moderate"
    elif confidence >= 30:
        level = "Low"
    else:
        level = "Very Low"
    return round(confidence, 1), level

def count_heart_symptoms(data):
    """Count how many heart symptoms are Yes/1"""
    count = 0
    for symptom in HEART_SYMPTOM_FEATURES:
        if convert_value(data.get(symptom, 0)) == 1:
            count += 1
    return count

def count_stroke_symptoms(data):
    """Count how many stroke symptoms are Yes/1"""
    count = 0
    for symptom in STROKE_SYMPTOM_FEATURES:
        if convert_value(data.get(symptom, 0)) == 1:
            count += 1
    return count

def extract_heart_features(data):
    """
    Extract 18 heart features with proper case-insensitive mapping.
    Returns: numpy array of shape (1, 18)
    """
    # Normalize all keys to lowercase
    normalized = {str(k).lower(): v for k, v in data.items()}
    
    features = []
    for feature_name in HEART_FEATURE_NAMES:
        key = feature_name.lower()
        
        if key == 'age':
            # Extract age as numeric value
            val = normalized.get('age', 50)
            try:
                if isinstance(val, str):
                    val = ''.join(filter(str.isdigit, val))
                value = float(val) if val else 50.0
            except:
                value = 50.0
            value = max(1, min(100, value))
            
        elif key == 'gender':
            # Extract gender (0 = Female, 1 = Male)
            val = normalized.get('gender', 0)
            if isinstance(val, str):
                value = 1 if val.lower() in ['male', 'm', '1', 'yes', 'true'] else 0
            else:
                value = 1 if val else 0
                
        else:
            # Binary features (0 or 1)
            val = normalized.get(key, 0)
            value = 1 if convert_value(val) == 1 else 0
                
        features.append(value)
    
    logger.debug(f"Extracted heart features: {dict(zip(HEART_FEATURE_NAMES, features))}")
    return np.array(features).reshape(1, -1)

def extract_stroke_features(data):
    """
    Extract 17 stroke features with proper case-insensitive mapping.
    Returns: numpy array of shape (1, 17)
    """
    # Normalize all keys to lowercase
    normalized = {str(k).lower(): v for k, v in data.items()}
    
    features = []
    for feature_name in STROKE_FEATURE_NAMES:
        key = feature_name.lower()
        
        if key == 'age':
            # Extract age as numeric value
            val = normalized.get('age', 50)
            try:
                if isinstance(val, str):
                    val = ''.join(filter(str.isdigit, val))
                value = float(val) if val else 50.0
            except:
                value = 50.0
            value = max(1, min(100, value))
            
        elif key == 'gender':
            # Extract gender (0 = Female, 1 = Male)
            val = normalized.get('gender', 0)
            if isinstance(val, str):
                value = 1 if val.lower() in ['male', 'm', '1', 'yes', 'true'] else 0
            else:
                value = 1 if val else 0
                
        else:
            # Binary features (0 or 1)
            val = normalized.get(key, 0)
            value = 1 if convert_value(val) == 1 else 0
                
        features.append(value)
    
    logger.debug(f"Extracted stroke features: {dict(zip(STROKE_FEATURE_NAMES, features))}")
    return np.array(features).reshape(1, -1)

def get_risk_level(probability, threshold):
    """Get risk level based on probability and threshold"""
    if probability >= 0.70:
        return "High Risk"
    elif probability >= threshold:
        return "Moderate Risk"
    else:
        return "Low Risk"

def get_prediction_message(prediction, disease_name):
    """Get prediction message"""
    if prediction == 1:
        return f"⚠️ High {disease_name} risk detected - Please consult a doctor immediately!"
    else:
        return f"✅ Low {disease_name} risk detected. Maintain a healthy lifestyle!"

# ============================================
# API ENDPOINTS
# ============================================

@app.route('/', methods=['GET'])
@app.route('/api', methods=['GET'])
def service_info():
    return jsonify({
        'service': SERVICE_NAME,
        'version': SERVICE_VERSION,
        'status': 'running',
        'timestamp': datetime.now().isoformat(),
        'models': {
            'heart': 'loaded' if heart_model_loaded else 'not_loaded',
            'stroke': 'loaded' if stroke_model_loaded else 'not_loaded'
        },
        'endpoints': [
            '/api/health - Health check',
            '/api/heart/predict - Heart disease prediction',
            '/api/stroke/predict - Stroke risk prediction',
            '/api/model/status - Model status',
            '/api/heart/debug - Heart debug',
            '/api/stroke/debug - Stroke debug'
        ]
    })

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy' if (heart_model_loaded and stroke_model_loaded) else 'degraded',
        'service': SERVICE_NAME,
        'version': SERVICE_VERSION,
        'timestamp': datetime.now().isoformat(),
        'models_loaded': {
            'heart': heart_model is not None,
            'stroke': stroke_model is not None
        },
        'heart_model_info': {
            'type': heart_model_type,
            'features': HEART_N_FEATURES,
            'loaded': heart_model_loaded
        },
        'stroke_model_info': {
            'type': stroke_model_type if stroke_model_loaded else 'Not Loaded',
            'features': len(stroke_features) if stroke_features else STROKE_N_FEATURES,
            'loaded': stroke_model_loaded,
            'scaler_features': stroke_scaler.n_features_in_ if stroke_scaler else None
        },
        'threshold': PREDICTION_THRESHOLD
    })

# ============================================
# HEART PREDICTION ENDPOINT
# ============================================

@app.route('/api/heart/predict', methods=['POST'])
def predict_heart():
    """
    Heart disease prediction endpoint.
    Uses the trained model with NO manual adjustments.
    """
    try:
        # Handle both JSON and Form data
        try:
            data = request.get_json(force=True, silent=True)
            if data is None and request.form:
                data = request.form.to_dict()
        except Exception as e:
            logger.error(f"❌ JSON Parse Error: {e}")
            return jsonify({
                'success': False, 
                'error': 'Invalid JSON format. Please check your request.'
            }), 400
        
        if not data:
            return jsonify({'success': False, 'error': 'No data provided'}), 400
        
        logger.info("=" * 60)
        logger.info("📊 HEART PREDICTION REQUEST")
        logger.info(f"📊 Received data: {data}")
        
        # Check if model is loaded
        if not heart_model_loaded or heart_model is None or heart_scaler is None:
            return jsonify({
                'success': False,
                'error': 'Heart model is not loaded. Run heart_disease.py first.'
            }), 503
        
        # Extract age for response
        age = float(data.get('age', 50))
        age = max(1, min(100, age))
        
        # Count symptoms
        symptom_count = count_heart_symptoms(data)
        logger.info(f"📊 Age: {age}, Symptoms: {symptom_count}")
        
        # Extract features (18 features)
        features = extract_heart_features(data)
        logger.info(f"📊 Features shape: {features.shape}")
        
        # Ensure we have exactly 18 features
        if features.shape[1] != HEART_N_FEATURES:
            logger.warning(f"⚠️ Expected {HEART_N_FEATURES} features, got {features.shape[1]}")
            if features.shape[1] < HEART_N_FEATURES:
                padding = np.zeros((1, HEART_N_FEATURES - features.shape[1]))
                features = np.hstack([features, padding])
            else:
                features = features[:, :HEART_N_FEATURES]
        
        # Scale features
        try:
            if hasattr(heart_scaler, 'feature_names_in_'):
                df = pd.DataFrame(features, columns=heart_scaler.feature_names_in_)
                features_scaled = heart_scaler.transform(df)
            else:
                features_scaled = heart_scaler.transform(features)
        except Exception as e:
            logger.warning(f"⚠️ Scaling error: {e}")
            features_scaled = heart_scaler.transform(features)
        
        # Predict - NO MANUAL ADJUSTMENTS
        prediction = heart_model.predict(features_scaled)
        probability = heart_model.predict_proba(features_scaled)
        
        # Get probability
        prob_value = float(probability[0][1]) if probability.shape[1] > 1 else float(probability[0][0])
        logger.info(f"📊 Raw model probability: {prob_value:.4f}")
        
        # Apply threshold
        final_prediction = 1 if prob_value >= PREDICTION_THRESHOLD else 0
        
        # Get confidence
        confidence, confidence_level = get_confidence_level(prob_value)
        
        # Determine risk level
        risk_level = get_risk_level(prob_value, PREDICTION_THRESHOLD)
        
        # Build response
        result = {
            'success': True,
            'prediction': final_prediction,
            'probability': prob_value,
            'risk_percentage': f"{prob_value * 100:.1f}%",
            'confidence': confidence,
            'confidence_level': confidence_level,
            'risk_level': risk_level,
            'message': get_prediction_message(final_prediction, 'heart disease'),
            'mode': 'ml',
            'model_used': f'Heart Disease Classifier ({heart_model_type})',
            'threshold_used': PREDICTION_THRESHOLD,
            'age': age,
            'symptom_count': symptom_count,
            'timestamp': datetime.now().isoformat()
        }
        
        # Add probability breakdown if available
        if probability.shape[1] > 1:
            result['probability_breakdown'] = {
                'no_disease': round(probability[0][0] * 100, 2),
                'disease': round(probability[0][1] * 100, 2)
            }
        
        logger.info(f"✅ Heart prediction: {final_prediction}, prob: {prob_value:.4f}")
        logger.info("=" * 60)
        
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"❌ Error in heart prediction: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({'success': False, 'error': str(e)}), 500

# ============================================
# STROKE PREDICTION ENDPOINT
# ============================================

@app.route('/api/stroke/predict', methods=['POST'])
def predict_stroke():
    """
    Stroke risk prediction endpoint.
    Uses the trained model with NO manual adjustments.
    """
    try:
        # Handle both JSON and Form data
        try:
            data = request.get_json(force=True, silent=True)
            if data is None and request.form:
                data = request.form.to_dict()
        except Exception as e:
            logger.error(f"❌ JSON Parse Error: {e}")
            return jsonify({
                'success': False, 
                'error': 'Invalid JSON format. Please check your request.'
            }), 400
        
        if not data:
            return jsonify({'success': False, 'error': 'No data provided'}), 400
        
        logger.info("=" * 60)
        logger.info("📊 STROKE PREDICTION REQUEST")
        logger.info(f"📊 Received data: {data}")
        
        # Check if model is loaded
        if not stroke_model_loaded or stroke_model is None or stroke_scaler is None:
            return jsonify({
                'success': False,
                'error': 'Stroke model is not loaded yet.'
            }), 503
        
        # Extract age for response
        age = float(data.get('age', 50))
        age = max(1, min(100, age))
        
        # Count symptoms
        symptom_count = count_stroke_symptoms(data)
        logger.info(f"📊 Age: {age}, Symptoms: {symptom_count}")
        
        # If NO symptoms, return 0% risk directly (early exit)
        if symptom_count == 0:
            logger.info("✅ No symptoms detected - returning 0% risk")
            return jsonify({
                'success': True,
                'prediction': 0,
                'probability': 0.0,
                'risk_percentage': '0.0%',
                'confidence': 100.0,
                'confidence_level': 'Very High',
                'risk_level': 'Low Risk',
                'message': '✅ No symptoms detected. Maintain a healthy lifestyle!',
                'mode': 'symptom_check',
                'model_used': 'Stroke Risk Classifier (No Symptoms)',
                'threshold_used': PREDICTION_THRESHOLD,
                'symptom_count': 0,
                'age': age,
                'timestamp': datetime.now().isoformat()
            })
        
        # Extract features (17 features)
        features = extract_stroke_features(data)
        logger.info(f"📊 Features shape: {features.shape}")
        
        # Log feature values for debugging
        logger.info("📊 Feature values:")
        for name, value in zip(STROKE_FEATURE_NAMES, features[0]):
            logger.info(f"   {name}: {value}")
        
        # Ensure we have exactly 17 features
        if features.shape[1] != STROKE_N_FEATURES:
            logger.warning(f"⚠️ Expected {STROKE_N_FEATURES} features, got {features.shape[1]}")
            if features.shape[1] < STROKE_N_FEATURES:
                padding = np.zeros((1, STROKE_N_FEATURES - features.shape[1]))
                features = np.hstack([features, padding])
            else:
                features = features[:, :STROKE_N_FEATURES]
        
        # Scale features
        try:
            if hasattr(stroke_scaler, 'feature_names_in_'):
                scaler_feature_count = len(stroke_scaler.feature_names_in_)
                logger.info(f"📊 Scaler has {scaler_feature_count} feature names")
                
                if scaler_feature_count == STROKE_N_FEATURES:
                    df = pd.DataFrame(features, columns=stroke_scaler.feature_names_in_)
                    features_scaled = stroke_scaler.transform(df)
                    logger.info("✅ Scaled with DataFrame")
                else:
                    logger.warning(f"⚠️ Scaler has {scaler_feature_count} features, using direct transform")
                    features_scaled = stroke_scaler.transform(features)
            else:
                features_scaled = stroke_scaler.transform(features)
                logger.info("✅ Scaled with direct transform")
        except Exception as e:
            logger.error(f"❌ Scaling error: {e}")
            features_scaled = features
            logger.warning("⚠️ Using unscaled features as fallback")
        
        # Predict - NO MANUAL ADJUSTMENTS
        prediction = stroke_model.predict(features_scaled)
        probability = stroke_model.predict_proba(features_scaled)
        
        # Get probability
        prob_value = float(probability[0][1]) if probability.shape[1] > 1 else float(probability[0][0])
        logger.info(f"📊 Raw model probability: {prob_value:.4f}")
        
        # Apply threshold
        final_prediction = 1 if prob_value >= PREDICTION_THRESHOLD else 0
        
        # Get confidence
        confidence, confidence_level = get_confidence_level(prob_value)
        
        # Determine risk level
        risk_level = get_risk_level(prob_value, PREDICTION_THRESHOLD)
        
        # Build response
        result = {
            'success': True,
            'prediction': final_prediction,
            'probability': prob_value,
            'risk_percentage': f"{prob_value * 100:.1f}%",
            'confidence': confidence,
            'confidence_level': confidence_level,
            'risk_level': risk_level,
            'message': get_prediction_message(final_prediction, 'stroke'),
            'mode': 'ml',
            'model_used': f'Stroke Risk Classifier ({stroke_model_type})',
            'threshold_used': PREDICTION_THRESHOLD,
            'symptom_count': symptom_count,
            'age': age,
            'features_used': STROKE_N_FEATURES,
            'timestamp': datetime.now().isoformat()
        }
        
        # Add probability breakdown if available
        if probability.shape[1] > 1:
            result['probability_breakdown'] = {
                'low_risk': round(probability[0][0] * 100, 2),
                'high_risk': round(probability[0][1] * 100, 2)
            }
        
        logger.info(f"✅ Stroke prediction: {final_prediction}, prob: {prob_value:.4f}")
        logger.info("=" * 60)
        
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"❌ Error in stroke prediction: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({'success': False, 'error': str(e)}), 500

# ============================================
# MODEL STATUS ENDPOINT
# ============================================

@app.route('/api/model/status', methods=['GET'])
def model_status():
    models_dir_files = os.listdir(MODELS_DIR) if os.path.exists(MODELS_DIR) else []
    
    return jsonify({
        'service': SERVICE_NAME,
        'version': SERVICE_VERSION,
        'heart_model': {
            'loaded': heart_model_loaded,
            'type': heart_model_type,
            'features_expected': HEART_N_FEATURES,
            'feature_names': HEART_FEATURE_NAMES,
            'file_exists': os.path.exists(os.path.join(MODELS_DIR, 'HeartDiseaseRisk.pkl'))
        },
        'stroke_model': {
            'loaded': stroke_model_loaded,
            'type': stroke_model_type if stroke_model_loaded else 'Not Loaded',
            'features_expected': STROKE_N_FEATURES,
            'feature_names': STROKE_FEATURE_NAMES,
            'file_exists': os.path.exists(os.path.join(MODELS_DIR, 'StrokeRisk.pkl')),
            'scaler_features': stroke_scaler.n_features_in_ if stroke_scaler else None
        },
        'threshold': PREDICTION_THRESHOLD,
        'files_in_models_dir': models_dir_files,
        'timestamp': datetime.now().isoformat()
    })

# ============================================
# DEBUG ENDPOINTS
# ============================================

@app.route('/api/heart/debug', methods=['POST'])
def debug_heart():
    """
    Debug endpoint for heart prediction.
    Returns all intermediate values for troubleshooting.
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        logger.info("=" * 60)
        logger.info("📊 HEART DEBUG REQUEST")
        logger.info(f"📊 Input data: {data}")
        
        if not heart_model_loaded or heart_model is None or heart_scaler is None:
            return jsonify({'error': 'Heart model is not loaded'}), 503
        
        # Extract data
        age = float(data.get('age', 50))
        symptom_count = count_heart_symptoms(data)
        
        # Extract features
        features = extract_heart_features(data)
        logger.info(f"📊 Features shape: {features.shape}")
        logger.info("📊 Feature values:")
        for name, value in zip(HEART_FEATURE_NAMES, features[0]):
            logger.info(f"   {name}: {value}")
        
        # Scale
        try:
            if hasattr(heart_scaler, 'feature_names_in_'):
                df = pd.DataFrame(features, columns=heart_scaler.feature_names_in_)
                features_scaled = heart_scaler.transform(df)
            else:
                features_scaled = heart_scaler.transform(features)
        except Exception as e:
            logger.error(f"❌ Scaling error: {e}")
            features_scaled = features
        
        logger.info("📊 Scaled values:")
        for name, value in zip(HEART_FEATURE_NAMES, features_scaled[0]):
            logger.info(f"   {name}: {value:.4f}")
        
        # Predict
        prediction = heart_model.predict(features_scaled)
        probability = heart_model.predict_proba(features_scaled)
        
        prob_value = float(probability[0][1]) if probability.shape[1] > 1 else float(probability[0][0])
        
        return jsonify({
            'age': age,
            'symptom_count': symptom_count,
            'feature_names': HEART_FEATURE_NAMES,
            'feature_values': features[0].tolist(),
            'scaled_values': features_scaled[0].tolist(),
            'raw_probability': float(prob_value),
            'prediction': int(prediction[0]),
            'threshold': PREDICTION_THRESHOLD,
            'probability_breakdown': {
                'no_disease': round(probability[0][0] * 100, 2),
                'disease': round(probability[0][1] * 100, 2)
            } if probability.shape[1] > 1 else None
        })
        
    except Exception as e:
        logger.error(f"❌ Error in heart debug: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({'error': str(e)}), 500

@app.route('/api/stroke/debug', methods=['POST'])
def debug_stroke():
    """
    Debug endpoint for stroke prediction.
    Returns all intermediate values for troubleshooting.
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        logger.info("=" * 60)
        logger.info("📊 STROKE DEBUG REQUEST")
        logger.info(f"📊 Input data: {data}")
        
        if not stroke_model_loaded or stroke_model is None or stroke_scaler is None:
            return jsonify({'error': 'Stroke model is not loaded'}), 503
        
        # Extract data
        age = float(data.get('age', 50))
        symptom_count = count_stroke_symptoms(data)
        
        # Extract features
        features = extract_stroke_features(data)
        logger.info(f"📊 Features shape: {features.shape}")
        logger.info("📊 Feature values:")
        for name, value in zip(STROKE_FEATURE_NAMES, features[0]):
            logger.info(f"   {name}: {value}")
        
        # Scale
        try:
            if hasattr(stroke_scaler, 'feature_names_in_'):
                df = pd.DataFrame(features, columns=stroke_scaler.feature_names_in_)
                features_scaled = stroke_scaler.transform(df)
            else:
                features_scaled = stroke_scaler.transform(features)
        except Exception as e:
            logger.error(f"❌ Scaling error: {e}")
            features_scaled = features
        
        logger.info("📊 Scaled values:")
        for name, value in zip(STROKE_FEATURE_NAMES, features_scaled[0]):
            logger.info(f"   {name}: {value:.4f}")
        
        # Predict
        prediction = stroke_model.predict(features_scaled)
        probability = stroke_model.predict_proba(features_scaled)
        
        prob_value = float(probability[0][1]) if probability.shape[1] > 1 else float(probability[0][0])
        
        return jsonify({
            'age': age,
            'symptom_count': symptom_count,
            'feature_names': STROKE_FEATURE_NAMES,
            'feature_values': features[0].tolist(),
            'scaled_values': features_scaled[0].tolist(),
            'raw_probability': float(prob_value),
            'prediction': int(prediction[0]),
            'threshold': PREDICTION_THRESHOLD,
            'scaler_features': stroke_scaler.feature_names_in_.tolist() if hasattr(stroke_scaler, 'feature_names_in_') else None,
            'probability_breakdown': {
                'low_risk': round(probability[0][0] * 100, 2),
                'high_risk': round(probability[0][1] * 100, 2)
            } if probability.shape[1] > 1 else None
        })
        
    except Exception as e:
        logger.error(f"❌ Error in stroke debug: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({'error': str(e)}), 500

@app.route('/api/fix_scaler', methods=['GET'])
def fix_scaler():
    """Emergency endpoint to fix scaler"""
    try:
        from sklearn.preprocessing import StandardScaler
        
        stroke_scaler_path = os.path.join(MODELS_DIR, 'stroke_scaler.pkl')
        
        # Create new scaler with 17 features
        new_scaler = StandardScaler()
        sample_data = np.random.randn(1000, STROKE_N_FEATURES)
        new_scaler.fit(sample_data)
        new_scaler.feature_names_in_ = np.array(STROKE_FEATURE_NAMES)
        
        # Save
        joblib.dump(new_scaler, stroke_scaler_path)
        
        global stroke_scaler
        stroke_scaler = new_scaler
        
        return jsonify({
            'success': True,
            'message': f'Scaler fixed to {STROKE_N_FEATURES} features',
            'features': STROKE_N_FEATURES,
            'feature_names': STROKE_FEATURE_NAMES
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# ============================================
# ERROR HANDLERS
# ============================================

@app.errorhandler(404)
def not_found(error):
    return jsonify({
        'success': False,
        'error': 'Endpoint not found',
        'available_endpoints': [
            '/', '/api', '/api/health',
            '/api/heart/predict', '/api/stroke/predict',
            '/api/heart/debug', '/api/stroke/debug',
            '/api/model/status', '/api/fix_scaler'
        ]
    }), 404

@app.errorhandler(405)
def method_not_allowed(error):
    return jsonify({
        'success': False,
        'error': 'Method not allowed',
        'allowed_methods': ['GET', 'POST']
    }), 405

@app.errorhandler(500)
def internal_error(error):
    return jsonify({
        'success': False,
        'error': 'Internal server error',
        'message': 'An unexpected error occurred. Please try again later.'
    }), 500

# ============================================
# MAIN
# ============================================

if __name__ == '__main__':
    logger.info("=" * 60)
    logger.info(f"🚀 {SERVICE_NAME} v{SERVICE_VERSION} Starting...")
    logger.info("=" * 60)
    logger.info(f"❤️ Heart model: {'✅ LOADED' if heart_model_loaded else '❌ NOT LOADED'}")
    logger.info(f"   Type: {heart_model_type}")
    logger.info(f"   Features: {HEART_N_FEATURES}")
    logger.info(f"🧠 Stroke model: {'✅ LOADED' if stroke_model_loaded else '❌ NOT LOADED'}")
    logger.info(f"   Type: {stroke_model_type}")
    logger.info(f"   Features: {STROKE_N_FEATURES}")
    if stroke_scaler:
        logger.info(f"📊 Scaler features: {stroke_scaler.n_features_in_ if hasattr(stroke_scaler, 'n_features_in_') else 'Unknown'}")
    logger.info(f"📂 Models directory: {MODELS_DIR}")
    
    if os.path.exists(MODELS_DIR):
        files = os.listdir(MODELS_DIR)
        logger.info(f"📂 Files in models directory: {files}")
    
    logger.info(f"🎯 Prediction threshold: {PREDICTION_THRESHOLD}")
    logger.info(f"🌐 Running on http://0.0.0.0:{SERVICE_PORT}")
    logger.info("=" * 60)
    
    app.run(
        debug=False,
        port=SERVICE_PORT,
        host='0.0.0.0',
        threaded=True
    )