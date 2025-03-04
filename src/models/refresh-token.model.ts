import mongooseSchemaConfig from '@/config/db/basic-schema';
import { IRefreshToken } from '@/types/user.types';
import { Schema, model, Model } from 'mongoose';

interface IRefreshTokenMethods {}

type IRefreshTokenModel = Model<IRefreshToken, {}, IRefreshTokenMethods>;

// Schema Definition
const RefreshTokenSchema = new Schema<IRefreshToken, IRefreshTokenModel, IRefreshTokenMethods>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  token: { type: String, required: true },
  expires: { type: Date, required: true },
});

// Plugins
RefreshTokenSchema.plugin(mongooseSchemaConfig);

// Model Export
const RefreshToken = model<IRefreshToken, IRefreshTokenModel>('RefreshToken', RefreshTokenSchema);
export default RefreshToken;
