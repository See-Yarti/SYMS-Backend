import Vendor from '@/models/vendor.model';
import { IVendor, PopulatedVendor } from '@/types/user.types';
import { ObjectId, ClientSession, Types } from 'mongoose';

class VendorService {
  /**
   * Create a new vendor and associate it with a user
   * @param userId - The ID of the user becoming a vendor
   * @param vendorData - Vendor-specific details
   * @param session - MongoDB transaction session
   * @returns Created Vendor Document
   */
  async createVendor(userId: ObjectId, vendorData: Partial<IVendor>, session?: ClientSession): Promise<IVendor> {
    return await Vendor.create([{ user: userId, ...vendorData }], { session }).then((res) => res[0]);
  }

  /**
   * Get vendor by vendor ID
   * @param vendorID - The ID of the vendor
   * @returns Vendor Document
   */
  async getVendorById(vendorID: string | ObjectId): Promise<PopulatedVendor | null> {
    return Vendor.findById(typeof vendorID === 'string' ? new Types.ObjectId(vendorID) : vendorID).populate(
      'user',
    ) as unknown as PopulatedVendor;
  }

  /**
   * Get vendor by User ID
   * @param userID - The ID of the user
   * @returns Vendor Document
   */
  async getVendorByUserId(userID: ObjectId): Promise<PopulatedVendor | null> {
    return Vendor.findOne({ user: userID }).populate('user') as unknown as PopulatedVendor;
  }

  /**
   * Update Vendor Details
   */
  async updateVendor(vendorID: ObjectId, updateData: Partial<PopulatedVendor>): Promise<PopulatedVendor | null> {
    return Vendor.findByIdAndUpdate(vendorID, updateData, { new: true }).populate('user') as unknown as PopulatedVendor;
  }

  /**
   * Get all vendors
   */
  async getAllVendors(): Promise<PopulatedVendor[]> {
    return Vendor.find().populate('user') as unknown as PopulatedVendor[];
  }

  /**
   * Delete Vendor by ID
   */
  async deleteVendor(vendorID: ObjectId): Promise<IVendor | null> {
    return Vendor.findByIdAndDelete(vendorID);
  }

  /**
   * Check if vendor is verified
   */
  async isVendorVerified(vendorId: ObjectId): Promise<boolean> {
    const vendor = await Vendor.findById(vendorId);
    return vendor ? vendor.isVendorVerified : false;
  }

  /**
   * Verify Vendor
   * @param vendorID - The ID of the vendor
   **/
  async verifyVendor(vendorID: string | ObjectId): Promise<PopulatedVendor | null> {
    return Vendor.findByIdAndUpdate(
      typeof vendorID === 'string' ? new Types.ObjectId(vendorID) : vendorID,
      { isVendorVerified: true },
      { new: true },
    ).populate('user') as unknown as PopulatedVendor;
  }
}

export default VendorService;
