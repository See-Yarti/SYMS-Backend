import mongooseSchemaConfig from '@/config/db/basic-schema';
import { Schema, model, Model } from 'mongoose';

// User Type Definitions
export interface IUser {
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl?: string;
}

interface IUserMethods {
  fullName(): string;
}

type IUserModel = Model<IUser, {}, IUserMethods>;

// Schema Definition
const UserSchema = new Schema<IUser, IUserModel, IUserMethods>({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  avatarUrl: { type: String, required: false },
});

// Instance Methods
UserSchema.methods.fullName = function (): string {
  return `${this.firstName} ${this.lastName}`;
};

// Plugins
UserSchema.plugin(mongooseSchemaConfig);

// Model Export
const User = model<IUser, IUserModel>('User', UserSchema);
export default User;
