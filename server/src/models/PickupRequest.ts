import { Schema, model, type Document } from 'mongoose';

export interface IPickupRequest extends Document {
  eventId: string;
  organizerUid: string;
  partnerUid?: string;
  wasteTypes: string[];
  totalKg: number;
  pickupDate: string;
  pickupAddress: string;
  status: 'PENDING' | 'MATCHED' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PickupRequestSchema = new Schema<IPickupRequest>(
  {
    eventId: { type: String, required: true, index: true },
    organizerUid: { type: String, required: true, index: true },
    partnerUid: { type: String, index: true },
    wasteTypes: [{ type: String }],
    totalKg: { type: Number, default: 0 },
    pickupDate: { type: String, default: '' },
    pickupAddress: { type: String, default: '' },
    status: {
      type: String,
      enum: ['PENDING', 'MATCHED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
      default: 'PENDING',
      index: true,
    },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

export const PickupRequestModel = model<IPickupRequest>('PickupRequest', PickupRequestSchema);
