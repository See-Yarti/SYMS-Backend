import mongooseSchemaConfig from '@/config/db/basic-schema';
import { IVendor } from '@/types/user.types';
import { Schema, model, Model } from 'mongoose';

interface IVendorMethods {}

type IVendorModel = Model<IVendor, {}, IVendorMethods>;

const VendorSchema = new Schema<IVendor, IVendorModel, IVendorMethods>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  companyName: { type: String, required: true },
  isVendorVerified: { type: Boolean, required: true, default: false },
  designation: { type: String, required: true },
  taxRefNumber: { type: String, required: true },
  tradeLicense: { type: String, required: false },
  isDummyPassword: { type: Boolean, required: true, default: true },
});

// Plugins
VendorSchema.plugin(mongooseSchemaConfig);

const Vendor = model<IVendor, IVendorModel>('Vendor', VendorSchema);
export default Vendor;
