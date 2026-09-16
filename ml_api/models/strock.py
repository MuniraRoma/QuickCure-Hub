# -*- coding: utf-8 -*-
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC
from sklearn.naive_bayes import GaussianNB
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (accuracy_score, precision_score, recall_score,
                             f1_score, confusion_matrix, classification_report,
                             roc_auc_score, roc_curve)
import warnings
import joblib
import os
warnings.filterwarnings('ignore')

# ============================================================================
# 1. LOAD AND EXPLORE DATA
# ============================================================================

# Load dataset
df = pd.read_csv('stroke_risk_dataset_v2 (1).csv')

print("="*80)
print("STROKE RISK PREDICTION - DATA ANALYSIS")
print("="*80)
print(f"\nDataset Shape: {df.shape}")
print(f"Columns: {df.columns.tolist()}")
print(f"\nFirst 5 rows:\n{df.head()}")

# ============================================================================
# 2. DATA PREPROCESSING
# ============================================================================

print("\n" + "="*80)
print("DATA PREPROCESSING")
print("="*80)

# Check for missing values
print(f"Missing values: {df.isnull().sum().sum()}")
if df.isnull().sum().sum() > 0:
    # Replace missing values with median for numerical columns
    for col in df.columns:
        if df[col].dtype in ['float64', 'int64']:
            df[col].fillna(df[col].median(), inplace=True)
        elif df[col].dtype == 'object':
            df[col].fillna(df[col].mode()[0], inplace=True)
    print("Missing values replaced")

# Check for duplicates
duplicates = df.duplicated().sum()
print(f"Duplicate rows: {duplicates}")
if duplicates > 0:
    df.drop_duplicates(inplace=True)
    print(f"Duplicates removed. New shape: {df.shape}")

# Check data types
print(f"\nData types:\n{df.dtypes}")

# Identify categorical columns
categorical_cols = df.select_dtypes(include=['object']).columns.tolist()
print(f"\nCategorical columns: {categorical_cols}")

# ============================================================================
# 3. ENCODE CATEGORICAL VARIABLES
# ============================================================================

print("\n" + "="*80)
print("ENCODING CATEGORICAL VARIABLES")
print("="*80)

# Encode categorical columns using LabelEncoder
label_encoders = {}
for col in categorical_cols:
    le = LabelEncoder()
    df[col] = le.fit_transform(df[col].astype(str))
    label_encoders[col] = le
    print(f"Encoded '{col}': {dict(zip(le.classes_, le.transform(le.classes_)))}")

# Check if there are any remaining object columns
remaining_object_cols = df.select_dtypes(include=['object']).columns.tolist()
if remaining_object_cols:
    print(f"\nWarning: Still have object columns: {remaining_object_cols}")
    # Convert any remaining object columns to numeric
    for col in remaining_object_cols:
        df[col] = pd.to_numeric(df[col], errors='coerce')
        df[col].fillna(df[col].median(), inplace=True)

# Verify all columns are now numeric
print(f"\nAll columns numeric: {all(df.dtypes.apply(lambda x: np.issubdtype(x, np.number)))}")

# ============================================================================
# 4. EXPLORE TARGET VARIABLE
# ============================================================================

print("\n" + "="*80)
print("TARGET VARIABLE ANALYSIS")
print("="*80)

# Target column is 'at_risk'
target = 'at_risk'

if target not in df.columns:
    print(f"\nError: '{target}' target column not found!")
    print(f"Available columns: {df.columns.tolist()}")
    exit()

# ============================================================================
# 5. REMOVE LEAKAGE FEATURES & PREPARE DATA
# ============================================================================

print("\n" + "="*80)
print("REMOVING LEAKAGE FEATURES")
print("="*80)

# Identify leakage features (features that shouldn't be used for prediction)
leakage_features = ['stroke_risk_percentage']  # Add any other leakage features here

# Separate features and target (REMOVE leakage columns)
X = df.drop(columns=[target] + leakage_features)
y = df[target]

print(f"✅ Removed leakage features: {leakage_features}")
print(f"✅ Final feature count: {X.shape[1]}")
print(f"✅ Features: {X.columns.tolist()}")

# Check class imbalance
print(f"\nClass distribution:\n{y.value_counts()}")
class_0, class_1 = y.value_counts()[0], y.value_counts()[1]
print(f"Class ratio (0:1): {class_0 / class_1:.2f}")
print(f"Percentage at risk: {class_1 / len(y) * 100:.2f}%")

# ============================================================================
# 6. VISUALIZE DATA
# ============================================================================

print("\n" + "="*80)
print("DATA VISUALIZATION")
print("="*80)

# Target distribution
fig, axes = plt.subplots(1, 3, figsize=(15, 4))

# Target distribution
ax1 = axes[0]
target_counts = y.value_counts()
colors = ['#2ecc71', '#e74c3c']
ax1.bar(['Not At Risk (0)', 'At Risk (1)'], target_counts.values, color=colors)
ax1.set_title('Stroke Risk Distribution')
ax1.set_ylabel('Count')
ax1.set_xlabel('Risk Level')
for i, v in enumerate(target_counts.values):
    ax1.text(i, v + 5, str(v), ha='center', fontweight='bold')

# Target percentage
ax2 = axes[1]
labels = ['Not At Risk', 'At Risk']
sizes = target_counts.values
ax2.pie(sizes, labels=labels, autopct='%1.1f%%', colors=colors, startangle=90)
ax2.set_title('Risk Level Percentage')

# Age distribution by risk
ax3 = axes[2]
if 'age' in X.columns:
    df_temp = df.copy()
    df_temp['Risk_Level'] = df_temp['at_risk'].map({0: 'Not At Risk', 1: 'At Risk'})
    sns.histplot(data=df_temp, x='age', hue='Risk_Level', kde=True, ax=ax3, palette=colors)
    ax3.set_title('Age Distribution by Risk Level')
else:
    ax3.text(0.5, 0.5, 'Age column not found', ha='center', va='center', transform=ax3.transAxes)

plt.tight_layout()
plt.show()

# ============================================================================
# 7. HANDLE IMBALANCED DATA - IMPROVED
# ============================================================================

print("\n" + "="*80)
print("HANDLING CLASS IMBALANCE (IMPROVED)")
print("="*80)

try:
    from imblearn.over_sampling import SMOTE
    from imblearn.combine import SMOTETomek  # Better than SMOTE alone

    # ✅ Use SMOTE with full balancing (1:1 ratio)
    print("Applying SMOTE with full balancing...")
    smote = SMOTE(
        random_state=42,
        sampling_strategy=1.0,  # Full balance (1:1)
        k_neighbors=5
    )
    X_resampled, y_resampled = smote.fit_resample(X, y)
    print(f"✅ Resampled class distribution:\n{pd.Series(y_resampled).value_counts()}")

    X_data, y_data = X_resampled, y_resampled
    smote_applied = True

except ImportError:
    print("imbalanced-learn not installed. Using class weights instead.")
    smote_applied = False
    X_data, y_data = X, y

# Split data
X_train, X_test, y_train, y_test = train_test_split(
    X_data, y_data, test_size=0.2, random_state=42, stratify=y_data
)

# Standardize features
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

print(f"\nTraining set shape: {X_train_scaled.shape}")
print(f"Test set shape: {X_test_scaled.shape}")

# Save feature names for API
feature_names = X.columns.tolist()
print(f"\n✅ Features to be used in API: {feature_names}")
print(f"✅ Total features: {len(feature_names)}")

# ============================================================================
# 8. MODEL DEFINITIONS - IMPROVED
# ============================================================================

print("\n" + "="*80)
print("MODEL DEFINITIONS (OPTIMIZED)")
print("="*80)

# Calculate class_weight for imbalanced data
if not smote_applied:
    class_weight = {0: 1.0, 1: class_0 / class_1}
else:
    class_weight = None

# ✅ Optimized Random Forest with better parameters
rf_model = RandomForestClassifier(
    n_estimators=300,           # More trees for better generalization
    max_depth=25,               # Deeper trees
    min_samples_split=2,        # Less restrictive
    min_samples_leaf=1,         # Less restrictive
    max_features='sqrt',        # Use sqrt of features
    class_weight='balanced',    # Handle imbalance
    random_state=42,
    n_jobs=-1
)

# ✅ Other models with class weights
models = {
    'Logistic Regression': LogisticRegression(
        random_state=42,
        max_iter=1000,
        class_weight=class_weight,
        C=1.0
    ),
    'SVM': SVC(
        random_state=42,
        probability=True,
        class_weight=class_weight,
        kernel='rbf',
        C=1.0,
        gamma='scale'
    ),
    'Naive Bayes': GaussianNB(),
    'Random Forest': rf_model
}

print("✅ Models initialized with optimized parameters.")

# ============================================================================
# 9. TRAIN AND EVALUATE MODELS
# ============================================================================

print("\n" + "="*80)
print("MODEL TRAINING AND EVALUATION")
print("="*80)

results = []

for name, model in models.items():
    print(f"\n{'='*50}")
    print(f"Training {name}...")
    print('='*50)

    # Train model
    model.fit(X_train_scaled, y_train)

    # Make predictions
    y_pred = model.predict(X_test_scaled)
    y_pred_proba = model.predict_proba(X_test_scaled)[:, 1] if hasattr(model, "predict_proba") else None

    # Calculate metrics
    accuracy = accuracy_score(y_test, y_pred)
    precision = precision_score(y_test, y_pred, zero_division=0)
    recall = recall_score(y_test, y_pred, zero_division=0)
    f1 = f1_score(y_test, y_pred, zero_division=0)

    # ROC-AUC score
    roc_auc = roc_auc_score(y_test, y_pred_proba) if y_pred_proba is not None else None

    # Store results
    result = {
        'Model': name,
        'Accuracy': accuracy,
        'Precision': precision,
        'Recall': recall,
        'F1 Score': f1,
        'ROC-AUC': roc_auc
    }
    results.append(result)

    print(f"Accuracy: {accuracy:.4f}")
    print(f"Precision: {precision:.4f}")
    print(f"Recall: {recall:.4f}")  # ← Important for risk detection
    print(f"F1 Score: {f1:.4f}")
    if roc_auc:
        print(f"ROC-AUC Score: {roc_auc:.4f}")

    print("\nClassification Report:")
    print(classification_report(y_test, y_pred, zero_division=0))

    # Confusion Matrix
    cm = confusion_matrix(y_test, y_pred)
    plt.figure(figsize=(6, 4))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues',
                xticklabels=['Not At Risk', 'At Risk'],
                yticklabels=['Not At Risk', 'At Risk'])
    plt.title(f'Confusion Matrix - {name}')
    plt.ylabel('True Label')
    plt.xlabel('Predicted Label')
    plt.tight_layout()
    plt.show()

# ============================================================================
# 10. MODEL COMPARISON
# ============================================================================

print("\n" + "="*80)
print("MODEL COMPARISON")
print("="*80)

results_df = pd.DataFrame(results)
results_df = results_df.round(4)
print(results_df.to_string(index=False))

# Plot comparison
fig, axes = plt.subplots(1, 2, figsize=(14, 6))

# Metrics comparison
metrics = ['Accuracy', 'Precision', 'Recall', 'F1 Score', 'ROC-AUC']
results_df_melted = results_df.melt(id_vars=['Model'], value_vars=metrics,
                                     var_name='Metric', value_name='Score')

sns.barplot(data=results_df_melted, x='Metric', y='Score', hue='Model', ax=axes[0])
axes[0].set_title('Model Performance Comparison')
axes[0].legend(loc='upper right')
axes[0].set_ylim(0, 1)

# Model comparison bar chart
best_models = results_df.nlargest(3, 'Accuracy')
sns.barplot(data=best_models, x='Model', y='Accuracy', ax=axes[1], palette='viridis')
axes[1].set_title('Top 3 Models by Accuracy')
axes[1].set_ylabel('Accuracy')
axes[1].set_ylim(0, 1)

plt.tight_layout()
plt.show()

# ============================================================================
# 11. FEATURE IMPORTANCE ANALYSIS (Random Forest Only)
# ============================================================================

print("\n" + "="*80)
print("FEATURE IMPORTANCE (Random Forest)")
print("="*80)

# Get Random Forest model
rf_model = models['Random Forest']
feature_importance = pd.DataFrame({
    'Feature': X.columns,
    'Importance': rf_model.feature_importances_
}).sort_values('Importance', ascending=False)

print(feature_importance.to_string(index=False))

# Plot feature importance
fig, ax = plt.subplots(figsize=(14, 10))
colors = plt.cm.Blues(np.linspace(0.3, 0.9, len(feature_importance)))[::-1]
bars = ax.barh(feature_importance['Feature'], feature_importance['Importance'], color=colors)
ax.set_xlabel('Importance')
ax.set_title('Feature Importances from Random Forest')
ax.invert_yaxis()

# Add value labels
for bar in bars:
    width = bar.get_width()
    if width > 0.005:
        ax.text(width + 0.005, bar.get_y() + bar.get_height()/2,
                f'{width:.3f}', ha='left', va='center', fontsize=8)

plt.tight_layout()
plt.show()

# ============================================================================
# 12. ROC CURVES
# ============================================================================

print("\n" + "="*80)
print("ROC CURVES")
print("="*80)

plt.figure(figsize=(10, 8))
for name, model in models.items():
    if hasattr(model, "predict_proba"):
        y_proba = model.predict_proba(X_test_scaled)[:, 1]
        fpr, tpr, _ = roc_curve(y_test, y_proba)
        auc = roc_auc_score(y_test, y_proba)
        plt.plot(fpr, tpr, label=f'{name} (AUC = {auc:.4f})')

plt.plot([0, 1], [0, 1], 'k--', label='Random Classifier')
plt.xlabel('False Positive Rate')
plt.ylabel('True Positive Rate')
plt.title('ROC Curves for All Models')
plt.legend(loc='lower right')
plt.grid(True, alpha=0.3)
plt.tight_layout()
plt.show()

# ============================================================================
# 13. ADDITIONAL INSIGHTS - CORRELATION ANALYSIS
# ============================================================================

print("\n" + "="*80)
print("CORRELATION ANALYSIS")
print("="*80)

# Correlation with target (using the data without leakage)
correlations = df[feature_names + [target]].corr()[target].sort_values(ascending=False)
print("Top features correlated with at_risk:")
print(correlations.head(15))

# Plot correlation heatmap (top features)
top_features = correlations.head(15).index.tolist()
if target in top_features:
    top_features.remove(target)
top_features = top_features[:12]  # Limit to top 12 features

plt.figure(figsize=(12, 10))
corr_matrix = df[top_features + [target]].corr()
sns.heatmap(corr_matrix, annot=True, cmap='RdBu_r', center=0, fmt='.2f')
plt.title('Correlation Heatmap - Top Features')
plt.tight_layout()
plt.show()

# ============================================================================
# 14. SAVE MODEL AND PREPROCESSORS
# ============================================================================

print("\n" + "="*80)
print("SAVING MODEL AND PREPROCESSORS")
print("="*80)

# Create models directory if it doesn't exist
os.makedirs('models', exist_ok=True)

# ✅ Choose best model based on F1 Score (better for imbalanced)
best_model_name = results_df.loc[results_df['F1 Score'].idxmax(), 'Model']
best_model = models[best_model_name]

# Save model
joblib.dump(best_model, "models/StrokeRisk.pkl")
print(f"✅ Model saved: models/StrokeRisk.pkl ({best_model_name})")

# Save scaler
joblib.dump(scaler, "models/stroke_scaler.pkl")
print(f"✅ Scaler saved: models/stroke_scaler.pkl")

# Save feature names (17 features)
joblib.dump(feature_names, "models/stroke_features.pkl")
print(f"✅ Feature names saved: models/stroke_features.pkl")
print(f"   Features: {feature_names}")

# Save label encoders
joblib.dump(label_encoders, "models/stroke_label_encoders.pkl")
print(f"✅ Label encoders saved: models/stroke_label_encoders.pkl")

# ✅ Save metadata with threshold information
metadata = {
    'model_name': best_model_name,
    'features': feature_names,
    'n_features': len(feature_names),
    'accuracy': results_df.loc[results_df['Model'] == best_model_name, 'Accuracy'].values[0],
    'f1_score': results_df.loc[results_df['Model'] == best_model_name, 'F1 Score'].values[0],
    'precision': results_df.loc[results_df['Model'] == best_model_name, 'Precision'].values[0],
    'recall': results_df.loc[results_df['Model'] == best_model_name, 'Recall'].values[0],
    'smote_applied': smote_applied,
    'class_distribution': y.value_counts().to_dict(),
    'n_samples': len(df),
    'recommended_threshold': 0.35,  # ← Lower threshold for better risk detection
    'feature_importance': feature_importance.to_dict()
}
joblib.dump(metadata, "models/stroke_metadata.pkl")
print(f"✅ Metadata saved: models/stroke_metadata.pkl")

print("\n" + "="*80)
print("✅ ALL FILES SAVED SUCCESSFULLY")
print("="*80)

# ============================================================================
# 15. TEST WITH ALL SYMPTOMS "YES" - DEBUG
# ============================================================================

print("\n" + "="*80)
print("🧪 TEST: ALL SYMPTOMS = YES")
print("="*80)

# Create a test patient with all symptoms = Yes
test_patient = {}
for feature in feature_names:
    if feature == 'age':
        test_patient[feature] = 65
    elif feature == 'gender':
        test_patient[feature] = 1
    else:
        test_patient[feature] = 1  # All symptoms Yes

print(f"\nTest Patient Features:")
for k, v in test_patient.items():
    print(f"  {k}: {v}")

# Convert to DataFrame
test_df = pd.DataFrame([test_patient])[feature_names]
test_scaled = scaler.transform(test_df)

# Predict with best model
pred = best_model.predict(test_scaled)
proba = best_model.predict_proba(test_scaled)[0, 1]

print(f"\n📊 Prediction Result:")
print(f"  Prediction: {'⚠️ Risk Detected' if pred[0] == 1 else '✅ No Risk'}")
print(f"  Probability: {proba*100:.1f}%")
print(f"  Risk Level: {'High Risk' if proba >= 0.65 else 'Moderate Risk' if proba >= 0.35 else 'Low Risk'}")
print(f"  Confidence: {proba*100:.1f}%")

if proba < 70:
    print("\n⚠️ WARNING: Probability is LOW even with ALL symptoms = YES!")
    print("Possible reasons:")
    print("  1. Dataset may be imbalanced (more 'No Risk' examples)")
    print("  2. Features may not be strongly correlated with stroke risk")
    print("  3. Consider collecting more diverse data")
else:
    print("\n✅ Model is working correctly with all symptoms = YES!")

# ============================================================================
# 16. FINAL RECOMMENDATIONS
# ============================================================================

print("\n" + "="*80)
print("FINAL RECOMMENDATIONS")
print("="*80)

# Find best model based on multiple metrics
best_accuracy = results_df.loc[results_df['Accuracy'].idxmax()]
best_f1 = results_df.loc[results_df['F1 Score'].idxmax()]
best_roc = results_df.loc[results_df['ROC-AUC'].idxmax()]

print(f"Best Accuracy: {best_accuracy['Model']} with {best_accuracy['Accuracy']:.4f}")
print(f"Best F1 Score: {best_f1['Model']} with {best_f1['F1 Score']:.4f}")
print(f"Best ROC-AUC: {best_roc['Model']} with {best_roc['ROC-AUC']:.4f}")

print("\nTop 15 Most Important Features:")
print(feature_importance.head(15).to_string(index=False))

# Add interpretation of key features
print("\nInterpretation of Key Risk Factors:")
for idx, row in feature_importance.head(15).iterrows():
    feature = row['Feature']
    importance = row['Importance'] * 100
    # Clean up feature names for display
    display_name = feature.replace('_', ' ').title()
    print(f"  • {display_name}: {importance:.1f}% importance")

# Summary of findings
print("\n" + "="*80)
print("SUMMARY OF FINDINGS")
print("="*80)

print(f"""
1. Dataset contains {df.shape[0]} records with {df.shape[1]} features.
2. Target variable distribution: {y.value_counts().to_dict()}
3. Percentage of patients at risk: {class_1 / len(y) * 100:.2f}%
4. Features used for prediction: {len(feature_names)} features
5. Recommended threshold for prediction: 0.35 (lowered for better sensitivity)
6. Best performing model: {best_f1['Model']} with F1 Score of {best_f1['F1 Score']:.4f}
7. Model files saved in 'models/' directory for API deployment
""")

# ============================================================================
# 17. SAVE THRESHOLD CONFIG
# ============================================================================

threshold_config = {
    'threshold': 0.35,
    'risk_levels': {
        'high': 0.65,
        'moderate': 0.35,
        'low': 0.0
    },
    'confidence_levels': {
        'high': 0.65,
        'moderate': 0.45,
        'low': 0.0
    }
}

joblib.dump(threshold_config, "models/stroke_threshold.pkl")
print("✅ Threshold config saved: models/stroke_threshold.pkl")

print("\n" + "="*80)
print("PROCESSING COMPLETE")
print("="*80)