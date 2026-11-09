import { Schema, model, type Document } from 'mongoose';

export interface IUser extends Document {
  uid: string;
  name: string;
  email: string;
  photoURL?: string;
  role: 'ORGANIZER' | 'RECOVERY_PARTNER';
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    uid: { type: String, required: true, unique: true, index: true },
    name: { type: String, default: '' },
    email: { type: String, required: true, index: true },
    photoURL: { type: String, default: '' },
    role: { type: String, enum: ['ORGANIZER', 'RECOVERY_PARTNER'], default: 'ORGANIZER' },
  },
  { timestamps: true }
);

export const UserModel = model<IUser>('User', UserSchema);
