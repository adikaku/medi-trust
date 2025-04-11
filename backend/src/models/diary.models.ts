import mongoose from 'mongoose';

const diarySchema = new mongoose.Schema({
  userId: String,
  medicineId: String,
  medicineName: String,
  tags: [String],
  notes: String,
  date: Date
});

export default mongoose.model('Diary', diarySchema);