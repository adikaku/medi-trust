import mongoose, { Document } from 'mongoose';

export interface IUserLog extends Document {
  user_id: string;
  medicine_name: string;
  medicine_data: {
    name: string;
    sub_category: string;
    salt_composition: string;
    medicine_desc: string;
    side_effects: string;
    price: number;
    [key: string]: any; // for any extra fields from the medicine doc
  };
  created_at: Date;
}

const userLogSchema = new mongoose.Schema<IUserLog>({
  user_id: { type: String, required: true },
  medicine_name: { type: String, required: true },
  medicine_data: { type: Object, required: false, default: null },
  created_at: { type: Date, default: Date.now }
});

// Use third argument to bind model to 'user_logs' collection
export default mongoose.model<IUserLog>('UserLog', userLogSchema);