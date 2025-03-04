import { ObjectId } from 'mongoose';

export type TUserSession = {
  id: ObjectId;
  email: string;
  role: UserRole;
};

// Base Class Fields
export interface IBaseModel {
  id: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// User Roles
export enum UserRole {
  admin = 'admin',
  vendor = 'vendor',
  consumer = 'consumer',
}

// User Genders
export enum UserGender {
  male = 'male',
  female = 'female',
  other = 'other',
}

// Address Type
export interface UserAddress {
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  postalCode?: string;
  fullAddress?: string;
}

// User Type
export interface IUser extends IBaseModel {
  name: string;
  email: string;
  password: string;
  avatarUrl?: string;
  phoneNumber: string;
  gender: UserGender;
  address: UserAddress;
  ip?: string;
  loginAt: Date;
  isFirstLogin: boolean;
  agent: string;
  role: UserRole;
}

// Vendor Type (Separated)
export interface IVendor extends IBaseModel {
  user: ObjectId | IUser; // References User
  companyName: string;
  isVendorVerified: boolean;
  taxRefNumber: string;
  designation: string;
  isDummyPassword: boolean;
  tradeLicense?: string;
}

// Populated Vendor Type
export type PopulatedVendor = Omit<IVendor, 'user'> & { user: IUser };

// Consumer Type
export interface IConsumer extends IBaseModel {
  user: ObjectId | IUser; // References User
}

// Populated Consumer Type
export type PopulatedConsumer = Omit<IConsumer, 'user'> & { user: IUser };

// Profile Type (Union)
export type IProfile = IUser | IVendor | IConsumer;

// Refresh Token
export interface IRefreshToken {
  userId: ObjectId;
  token: string;
  expires: Date;
}
