import { Schema, model, type Document } from 'mongoose';

export interface IEvent extends Document {
  name: string;
  type: string;
  date: string;
  location: string;
  guestCount: number;
  duration: number;
  foodType: string;
  cateringType: string;
  decorationType: string;
  organizerUid: string;
  status: 'DRAFT' | 'ACTIVE' | 'COMPLETED';
  wastePredictionId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema = new Schema<IEvent>(
  {
    name: { type: String, required: true },
    type: { type: String, default: 'Wedding' },
    date: { type: String, default: '' },
    location: { type: String, default: 'India' },
    guestCount: { type: Number, default: 100 },
    duration: { type: Number, default: 4 },
    foodType: { type: String, default: 'Mixed' },
    cateringType: { type: String, default: 'External Caterer' },
    decorationType: { type: String, default: 'Flowers + Fabric' },
    organizerUid: { type: String, required: true, index: true },
    status: { type: String, enum: ['DRAFT', 'ACTIVE', 'COMPLETED'], default: 'ACTIVE' },
    wastePredictionId: { type: String },
  },
  { timestamps: true }
);

export const EventModel = model<IEvent>('Event', EventSchema);
