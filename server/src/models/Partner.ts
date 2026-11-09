import { Schema, model, type Document } from 'mongoose';

export interface IPartner extends Document {
  uid: string;
  orgName: string;
  wasteTypes: string[];
  capacityKg: number;
  location: string;
  lat?: number;
  lng?: number;
  available: boolean;
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PartnerSchema = new Schema<IPartner>(
  {
    uid: { type: String, required: true, unique: true, index: true },
    orgName: { type: String, required: true },
    wasteTypes: [{ type: String }],
    capacityKg: { type: Number, default: 500 },
    location: { type: String, default: 'India' },
    lat: { type: Number },
    lng: { type: Number },
    available: { type: Boolean, default: true },
    verified: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const PartnerModel = model<IPartner>('Partner', PartnerSchema);
