import mongoose, { Document } from 'mongoose';

//
// 🧬 Interface for Medicine
//
export interface IMedicine extends Document {
  name: string;
  sub_category?: string;
  salt_composition?: string;
  medicine_desc?: string;
  side_effects?: string;
  price?: number;
  manufacturer_name?: string;
  pack_size_label?: string;
}

//
// 🧬 Interface for GenericMed
//
export interface IGenericMed extends Document {
  generic_name: string;
  unit_size?: string;
  mrp?: number;
  similarity_score?: number; // optional, added during matching
}

//
// 🔧 Schemas (still strict: false to allow flexibility)
//
const medicineSchema = new mongoose.Schema({}, { strict: false });
const genericSchema = new mongoose.Schema({}, { strict: false });

//
// 🏷️ Models
//
export const Medicine = mongoose.model<IMedicine>('Medicine', medicineSchema, 'medicines');
export const GenericMed = mongoose.model<IGenericMed>('GenericMed', genericSchema, 'generic_med');