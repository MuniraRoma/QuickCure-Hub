const mongoose = require('mongoose');

const healthRecordSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userEmail: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  metrics: {
    gender: { type: String, default: "" },
    age: { type: String, default: "" },
    height: { type: String, default: "" },
    weight: { type: String, default: "" },
    bmi: { type: String, default: "" },
    bloodPressure: {
      systolic: { type: String, default: "" },
      diastolic: { type: String, default: "" }
    },
    heartRate: { type: String, default: "" },
    temperature: { type: String, default: "" },
    bloodSugar: {
      fasting: { type: String, default: "" },
      postprandial: { type: String, default: "" },
      hba1c: { type: String, default: "" }
    },
    lipidProfile: {
      totalCholesterol: { type: String, default: "" },
      hdl: { type: String, default: "" },
      ldl: { type: String, default: "" },
      triglycerides: { type: String, default: "" }
    },
    cbc: {
      hemoglobin: { type: String, default: "" },
      wbc: { type: String, default: "" },
      platelets: { type: String, default: "" },
      rbc: { type: String, default: "" },
      hematocrit: { type: String, default: "" },
      mcv: { type: String, default: "" },
      mch: { type: String, default: "" },
      mchc: { type: String, default: "" },
      rdw: { type: String, default: "" }
    },
    kidneyFunction: {
      creatinine: { type: String, default: "" },
      bun: { type: String, default: "" },
      uricAcid: { type: String, default: "" },
      egfr: { type: String, default: "" }
    },
    liverFunction: {
      alt: { type: String, default: "" },
      ast: { type: String, default: "" },
      alp: { type: String, default: "" },
      bilirubin: { type: String, default: "" },
      protein: { type: String, default: "" },
      albumin: { type: String, default: "" },
      globulin: { type: String, default: "" },
      ggt: { type: String, default: "" }
    },
    vitamins: {
      vitaminD: { type: String, default: "" },
      vitaminB12: { type: String, default: "" },
      folate: { type: String, default: "" },
      vitaminA: { type: String, default: "" },
      vitaminE: { type: String, default: "" },
      vitaminK: { type: String, default: "" },
      vitaminC: { type: String, default: "" }
    },
    ironProfile: {
      serumIron: { type: String, default: "" },
      ferritin: { type: String, default: "" },
      transferrin: { type: String, default: "" },
      tibc: { type: String, default: "" },
      ironSaturation: { type: String, default: "" },
      transferrinSaturation: { type: String, default: "" }
    },
    thyroid: {
      tsh: { type: String, default: "" },
      t3: { type: String, default: "" },
      t4: { type: String, default: "" },
      freeT3: { type: String, default: "" },
      freeT4: { type: String, default: "" },
      antiTPO: { type: String, default: "" },
      antiTG: { type: String, default: "" }
    },
    lifestyle: {
      exercise: { type: String, default: "" },
      sleep: { type: String, default: "" },
      stress: { type: String, default: "" },
      smoking: { type: String, default: "" },
      alcohol: { type: String, default: "" }
    },
    cardiovascularRisk: {
      hasHighBloodPressure: { type: String, default: "" },
      hasDiabetes: { type: String, default: "" },
      hasHighCholesterol: { type: String, default: "" },
      hasFamilyHistory: { type: String, default: "" },
      hasPreviousHeartAttack: { type: String, default: "" },
      hasHeartFailure: { type: String, default: "" },
      hasAngina: { type: String, default: "" },
      hasCoronaryArteryDisease: { type: String, default: "" },
      onBloodPressureMeds: { type: String, default: "" },
      onCholesterolMeds: { type: String, default: "" },
      onBloodThinners: { type: String, default: "" },
      onDiabetesMeds: { type: String, default: "" },
      hasChestPain: { type: String, default: "" },
      hasShortnessOfBreath: { type: String, default: "" },
      hasPalpitations: { type: String, default: "" },
      hasDizziness: { type: String, default: "" },
      hasLegSwelling: { type: String, default: "" },
      hasFatigue: { type: String, default: "" }
    },
    strokeRisk: {
      hasHighBloodPressure: { type: String, default: "" },
      hasDiabetes: { type: String, default: "" },
      hasHighCholesterol: { type: String, default: "" },
      hasAtrialFibrillation: { type: String, default: "" },
      hasPreviousStroke: { type: String, default: "" },
      hasPreviousTIA: { type: String, default: "" },
      hasFamilyHistoryStroke: { type: String, default: "" },
      hasCarotidArteryDisease: { type: String, default: "" },
      hasHeartDisease: { type: String, default: "" },
      hasSickleCellDisease: { type: String, default: "" },
      onAnticoagulants: { type: String, default: "" },
      onAntiplatelets: { type: String, default: "" },
      hasSedentaryLifestyle: { type: String, default: "" },
      hasFacialDrooping: { type: String, default: "" },
      hasArmWeakness: { type: String, default: "" },
      hasSpeechDifficulty: { type: String, default: "" },
      hasTimeToCall: { type: String, default: "" },
      hasSuddenSevereHeadache: { type: String, default: "" },
      hasSuddenVisionLoss: { type: String, default: "" },
      hasSuddenConfusion: { type: String, default: "" },
      hasSuddenBalanceIssues: { type: String, default: "" }
    }
  },
  notes: {
    type: String,
    default: ""
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

module.exports = mongoose.model('HealthRecord', healthRecordSchema);