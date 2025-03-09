import mongoose from 'mongoose';

// MongoDB接続がまだ確立されていない場合は接続する
const connectDB = async () => {
  if (mongoose.connections[0].readyState) {
    return;
  }
  
  await mongoose.connect(process.env.MONGODB_URI || "mongodb+srv://<username>:<password>@<cluster-url>/?retryWrites=true&w=majority");
};

// 診断データのスキーマ
const DiagnosisSchema = new mongoose.Schema({
  clinicInfo: {
    clinicName: String,
    respondentName: String,
    email: String,
    date: Date
  },
  answers: {
    q1: Boolean, q2: Boolean, q3: Boolean, q4: Boolean, q5: Boolean,
    q6: Boolean, q7: Boolean, q8: Boolean, q9: Boolean, q10: Boolean,
    q11: Boolean, q12: Boolean, q13: Boolean, q14: Boolean, q15: Boolean,
    q16: Boolean, q17: Boolean, q18: Boolean, q19: Boolean, q20: Boolean
  },
  results: {
    categories: {
      finance: Number,
      patients: Number,
      staff: Number,
      satisfaction: Number
    },
    totalYes: Number,
    status: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// モデルが既に存在する場合は再利用し、存在しない場合は新規作成
export const Diagnosis = mongoose.models.Diagnosis || mongoose.model('Diagnosis', DiagnosisSchema);

export { connectDB };
