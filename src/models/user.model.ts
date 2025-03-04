import mongooseSchemaConfig from '@/config/db/basic-schema';
import { IUser, UserGender, UserRole } from '@/types/user.types';
import { Schema, model, Model } from 'mongoose';

interface IUserMethods {}

type IUserModel = Model<IUser, {}, IUserMethods>;

const UserSchema = new Schema<IUser, IUserModel, IUserMethods>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  avatarUrl: { type: String, required: false },
  phoneNumber: { type: String, required: true },
  gender: { type: String, enum: UserGender, default: UserGender.other },
  address: {
    street: { type: String, required: false },
    city: { type: String, required: false },
    state: { type: String, required: false },
    zipCode: { type: String, required: false },
    country: { type: String, required: false },
    postalCode: { type: String, required: false },
    fullAddress: { type: String, required: true },
  },
  loginAt: { type: Date, required: true },
  isFirstLogin: { type: Boolean, default: true },
  agent: { type: String, required: true },
  ip: { type: String, required: false },
  role: { type: String, enum: UserRole, default: UserRole.consumer },
});

// Plugins
UserSchema.plugin(mongooseSchemaConfig);

const User = model<IUser, IUserModel>('User', UserSchema);
export default User;
