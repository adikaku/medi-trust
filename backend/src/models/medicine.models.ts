import mongoose from 'mongoose';
const medicineSchema = new mongoose.Schema({}, { strict: false });
export default mongoose.model('Medicine', medicineSchema);