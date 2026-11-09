import { Schema, model, type Document } from 'mongoose';

export interface IPrediction extends Document {
  uid?: string;
  eventId?: string;
  input: {
    event_type: string;
    guest_count: number;
    duration: number;
    food_type: string;
    catering_type: string;
    decoration_type: string;
    location: string;
  };
  result: {
    total_waste_kg: number;
    food_waste_kg: number;
    flower_waste_kg: number;
    plastic_waste_kg: number;
    paper_waste_kg: number;
    fabric_waste_kg: number;
    recoverable_waste_kg: number;
    diversion_percentage: number;
    recommendations: string[];
    explanation: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const PredictionSchema = new Schema<IPrediction>(
  {
    uid: { type: String, index: true },
    eventId: { type: String, index: true },
    input: {
      event_type: { type: String, default: 'Wedding' },
      guest_count: { type: Number, default: 100 },
      duration: { type: Number, default: 4 },
      food_type: { type: String, default: 'Mixed' },
      catering_type: { type: String, default: 'External Caterer' },
      decoration_type: { type: String, default: 'Flowers + Fabric' },
      location: { type: String, default: 'India' },
    },
    result: {
      total_waste_kg: { type: Number, default: 0 },
      food_waste_kg: { type: Number, default: 0 },
      flower_waste_kg: { type: Number, default: 0 },
      plastic_waste_kg: { type: Number, default: 0 },
      paper_waste_kg: { type: Number, default: 0 },
      fabric_waste_kg: { type: Number, default: 0 },
      recoverable_waste_kg: { type: Number, default: 0 },
      diversion_percentage: { type: Number, default: 0 },
      recommendations: [{ type: String }],
      explanation: { type: String, default: '' },
    },
  },
  { timestamps: true }
);

export const PredictionModel = model<IPrediction>('Prediction', PredictionSchema);
