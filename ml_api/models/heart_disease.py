import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC
from sklearn.naive_bayes import GaussianNB
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (accuracy_score, precision_score, recall_score,
                             f1_score, confusion_matrix, classification_report,
                             roc_auc_score, roc_curve)
import warnings
import joblib  # 🔥 Added for saving model
import os     # 🔥 Added for directory handling

warnings.filterwarnings('ignore')

# ============================================================================
# 1. LOAD AND EXPLORE DATA
# ============================================================================

# Load dataset - Updated for your dataset
df = pd.read_csv('heart_disease_risk_dataset_earlymed (1).csv')

print("="*80)
print("HEART DISEASE RISK PREDICTION - DATA ANALYSIS")
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
    print("Missing values replaced with median")

# Check for duplicates
duplicates = df.duplicated().sum()
print(f"Duplicate rows: {duplicates}")
if duplicates > 0:
    df.drop_duplicates(inplace=True)
    print(f"Duplicates removed. New shape: {df.shape}")

# Check data types
print(f"\nData types:\n{df.dtypes}")

# Statistical summary
print(f"\nStatistical Summary:\n{df.describe()}")

# ============================================================================
# 3. EXPLORE TARGET VARIABLE
# ============================================================================

print("\n" + "="*80)
print("TARGET VARIABLE ANALYSIS")
print("="*80)

# Check if target column exists
target = 'Heart_Risk'
if target not in df.columns:
    print(f"\nWarning: '{target}' target column not found.")
    print("Creating target based on symptoms and AGE...")

    # Calculate risk score based on multiple risk factors
    # Each column is binary (0 or 1), so we can sum them
    risk_columns = ['Chest_Pain', 'Shortness_of_Breath', 'Fatigue', 'Palpitations',
                    'Dizziness', 'Swelling', 'Pain_Arms_Jaw_Back', 'Cold_Sweats_Nausea',
                    'High_BP', 'High_Cholesterol', 'Diabetes', 'Smoking', 'Obesity',
                    'Sedentary_Lifestyle', 'Family_History', 'Chronic_Stress']

    # 🔥 UPDATED: Even higher weights for critical symptoms (Max 7)
    symptom_weights = {
        'Chest_Pain': 7, 'Shortness_of_Breath': 5, 'Fatigue': 3, 'Palpitations': 5,
        'Dizziness': 3, 'Swelling': 3, 'Pain_Arms_Jaw_Back': 7, 'Cold_Sweats_Nausea': 6,
        'High_BP': 7, 'High_Cholesterol': 6, 'Diabetes': 5, 'Smoking': 5,
        'Obesity': 3, 'Sedentary_Lifestyle': 3, 'Family_History': 7, 'Chronic_Stress': 5
    }
    
    # Create weighted symptom score
    df['Risk_Score'] = 0
    for col, weight in symptom_weights.items():
        df['Risk_Score'] += df[col] * weight

    # 🔥 LOWERED AGE BONUS: Age 35+ gets a bonus to boost younger ages
    df['Risk_Score'] = df['Risk_Score'] + (df['Age'] >= 35).astype(int) * 5
    df['Risk_Score'] = df['Risk_Score'] + (df['Age'] >= 50).astype(int) * 5
    df['Risk_Score'] = df['Risk_Score'] + (df['Age'] >= 60).astype(int) * 5
    df['Risk_Score'] = df['Risk_Score'] + (df['Age'] >= 70).astype(int) * 5

    # 🔥 Increased threshold to 12 for maximum sensitivity
    df['Heart_Risk'] = (df['Risk_Score'] >= 12).astype(int)

    print(f"Created target variable 'Heart_Risk' using weighted symptoms + AGE factor.")
    print(f"Risk Score distribution:\n{df['Risk_Score'].value_counts().sort_index()}")
# Separate features and target
X = df.drop(columns=[target] + ['Risk_Score'] if 'Risk_Score' in df.columns else [target])
y = df[target]

# Check class imbalance
print(f"\nClass distribution:\n{y.value_counts()}")
class_0, class_1 = y.value_counts()[0], y.value_counts()[1]
print(f"Class ratio (0:1): {class_0 / class_1:.2f}")

# ============================================================================
# 4. VISUALIZE DATA
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
ax1.bar(['Low Risk (0)', 'High Risk (1)'], target_counts.values, color=colors)
ax1.set_title('Heart Risk Distribution')
ax1.set_ylabel('Count')
ax1.set_xlabel('Risk Level')
for i, v in enumerate(target_counts.values):
    ax1.text(i, v + 5, str(v), ha='center', fontweight='bold')

# Target percentage
ax2 = axes[1]
labels = ['Low Risk', 'High Risk']
sizes = target_counts.values
ax2.pie(sizes, labels=labels, autopct='%1.1f%%', colors=colors, startangle=90)
ax2.set_title('Risk Level Percentage')

# Age distribution by risk
ax3 = axes[2]
if 'Age' in X.columns:
    df_temp = df.copy()
    df_temp['Risk_Level'] = df_temp['Heart_Risk'].map({0: 'Low Risk', 1: 'High Risk'})
    sns.histplot(data=df_temp, x='Age', hue='Risk_Level', kde=True, ax=ax3, palette=colors)
    ax3.set_title('Age Distribution by Risk Level')
else:
    ax3.text(0.5, 0.5, 'Age column not found', ha='center', va='center', transform=ax3.transAxes)

plt.tight_layout()
plt.show()

# ============================================================================
# 5. HANDLE IMBALANCED DATA
# ============================================================================

print("\n" + "="*80)
print("HANDLING CLASS IMBALANCE")
print("="*80)

# Option 1: Use class weights for models that support it
# Option 2: Use SMOTE (requires imblearn)

try:
    from imblearn.over_sampling import SMOTE
    from imblearn.pipeline import Pipeline as ImbPipeline

    print("Applying SMOTE to handle class imbalance...")
    smote = SMOTE(random_state=42)
    X_resampled, y_resampled = smote.fit_resample(X, y)
    print(f"Resampled class distribution:\n{pd.Series(y_resampled).value_counts()}")

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

# ============================================================================
# 6. MODEL DEFINITIONS
# ============================================================================

print("\n" + "="*80)
print("MODEL DEFINITIONS")
print("="*80)

# Calculate class_weight for imbalanced data
if not smote_applied:
    class_weight = {0: 1.0, 1: class_0 / class_1}
else:
    class_weight = None

models = {
    'Logistic Regression': LogisticRegression(
        random_state=42,
        max_iter=1000,
        class_weight=class_weight
    ),
    'SVM': SVC(
        random_state=42,
        probability=True,
        class_weight=class_weight,
        kernel='rbf'
    ),
    'Naive Bayes': GaussianNB(),
    'Random Forest': RandomForestClassifier(
        random_state=42,
        n_estimators=100,
        max_depth=15,
        min_samples_split=5,
        class_weight='balanced' if not smote_applied else None
    )
}

print("Models initialized. Class weights applied where appropriate.")

# ============================================================================
# 7. TRAIN AND EVALUATE MODELS
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
    print(f"Recall: {recall:.4f}")
    print(f"F1 Score: {f1:.4f}")
    if roc_auc:
        print(f"ROC-AUC Score: {roc_auc:.4f}")

    print("\nClassification Report:")
    print(classification_report(y_test, y_pred, zero_division=0))

    # Confusion Matrix
    cm = confusion_matrix(y_test, y_pred)
    plt.figure(figsize=(6, 4))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues',
                xticklabels=['Low Risk', 'High Risk'],
                yticklabels=['Low Risk', 'High Risk'])
    plt.title(f'Confusion Matrix - {name}')
    plt.ylabel('True Label')
    plt.xlabel('Predicted Label')
    plt.tight_layout()
    plt.show()

# ============================================================================
# 8. MODEL COMPARISON
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
# 9. FEATURE IMPORTANCE ANALYSIS (Random Forest Only)
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
# 10. ROC CURVES
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
# 11. ADDITIONAL INSIGHTS - CORRELATION ANALYSIS
# ============================================================================

print("\n" + "="*80)
print("CORRELATION ANALYSIS")
print("="*80)

# Correlation with target
correlations = df.corr()[target].sort_values(ascending=False)
print("Top features correlated with Heart_Risk:")
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
# 12. FINAL RECOMMENDATIONS
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
3. The most important risk factors identified are:
   - {feature_importance.iloc[0]['Feature'].replace('_', ' ').title()}: {feature_importance.iloc[0]['Importance']*100:.1f}%
   - {feature_importance.iloc[1]['Feature'].replace('_', ' ').title()}: {feature_importance.iloc[1]['Importance']*100:.1f}%
   - {feature_importance.iloc[2]['Feature'].replace('_', ' ').title()}: {feature_importance.iloc[2]['Importance']*100:.1f}%
4. Best performing model: {best_f1['Model']} with F1 Score of {best_f1['F1 Score']:.4f}
""")

print("\n" + "="*80)
print("PROCESSING COMPLETE")
print("="*80)

# ============================================================================
# 🔥 13. SAVE MODEL AND PREPROCESSORS (NEWLY ADDED)
# ============================================================================

print("\n" + "="*80)
print("SAVING MODEL AND PREPROCESSORS FOR APP.PY")
print("="*80)

# Create models directory if it doesn't exist (it should already exist)
os.makedirs('models', exist_ok=True)

# Get the best model (Random Forest)
best_model = models['Random Forest']

# Save model
joblib.dump(best_model, "models/HeartDiseaseRisk.pkl")
print(f"✅ Model saved: models/HeartDiseaseRisk.pkl")

# Save scaler
joblib.dump(scaler, "models/heart_scaler.pkl")
print(f"✅ Scaler saved: models/heart_scaler.pkl")

# Save feature names
feature_names = X.columns.tolist()
joblib.dump(feature_names, "models/heart_features.pkl")
print(f"✅ Feature names saved: models/heart_features.pkl")

print("\n" + "="*80)
print("✅ ALL HEART MODEL FILES SAVED SUCCESSFULLY")
print("="*80)