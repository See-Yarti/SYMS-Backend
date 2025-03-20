import Vendor from '@/models/vendor.model';
import { IVendor, PopulatedVendor } from '@/types/user.types';
import { ObjectId, ClientSession, Types } from 'mongoose';

type GetVendorsOptions = {
  vendorFields?: string[];
  userFields?: string[];
  filter?: Record<string, any>;
  sort?: Record<string, 1 | -1>;
  isPasswordIncluded?: boolean;
  page?: number;
  limit?: number;
};

type GetVendorByIdOptions = Omit<GetVendorsOptions, 'page' | 'limit'>;

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
   * @param options - Options for fetching the vendor
   * @returns Vendor Document
   */
  async getVendorById(vendorID: string | ObjectId, options?: GetVendorByIdOptions): Promise<PopulatedVendor | null> {
    return this._getVendor({ _id: vendorID }, options);
  }

  /**
   * Get vendor by User ID
   * @param userID - The ID of the user
   * @param options - Options for fetching the vendor
   * @returns Vendor Document
   */
  async getVendorByUserId(userID: string | ObjectId, options?: GetVendorByIdOptions): Promise<PopulatedVendor | null> {
    return this._getVendor({ user: userID }, options);
  }

  /**
   * Get all vendors with filtering, pagination, and optional field selection
   * @param options - Options for fetching vendors
   * @returns List of Populated Vendors
   */
  async getVendors(options?: GetVendorsOptions): Promise<PopulatedVendor[]> {
    const {
      vendorFields = [], // Fetch all vendor fields if not specified
      userFields = [], // Fetch all user fields if not specified
      filter = {}, // Additional filters
      sort = {}, // Sorting options
      isPasswordIncluded = false, // Exclude password by default
      page = 1, // Default page 1
      limit = 10, // Default limit 10
    } = options || {};

    // Default user fields if none are specified
    let selectedUserFields = userFields.length ? userFields : ['_id', 'name', 'email'];

    // Ensure password is not included unless explicitly requested
    if (!isPasswordIncluded) {
      selectedUserFields = selectedUserFields.filter((field) => field !== 'password');
    }

    // Pagination settings
    const skip = (page - 1) * limit;

    // Query vendors with pagination, filtering, sorting, and population
    const vendors = await Vendor.find(filter)
      .select(vendorFields.length ? vendorFields.join(' ') : '') // Select vendor fields
      .populate({
        path: 'user',
        select: selectedUserFields.join(' '), // Select user fields
      })
      .sort(sort) // Apply sorting
      .skip(skip) // Apply pagination
      .limit(limit) // Apply limit
      .exec();

    return vendors as unknown as PopulatedVendor[];
  }

  async countVendors(filter: Record<string, any> = {}): Promise<number> {
    return Vendor.countDocuments(filter);
  }

  /**
   * Update Vendor Details
   * @param vendorID - The ID of the vendor to update
   * @param updateData - The updated vendor data
   * @returns Updated Vendor Document
   */
  async updateVendor(vendorID: ObjectId, updateData: Partial<IVendor>): Promise<PopulatedVendor | null> {
    return (await Vendor.findByIdAndUpdate(vendorID, updateData, { new: true })
      .populate('user')
      .exec()) as unknown as PopulatedVendor | null;
  }
  /**
   * Private reusable function for fetching a single vendor
   * @param matchCondition - Query condition (_id or user)
   * @param options - Options for filtering and selection
   * @returns Vendor Document
   */
  private async _getVendor(
    matchCondition: Record<string, any>,
    options?: GetVendorByIdOptions,
  ): Promise<PopulatedVendor | null> {
    const {
      vendorFields = [], // Fetch all vendor fields if not specified
      userFields = [], // Fetch all user fields if not specified
      filter = {}, // Additional filters
      sort = {}, // Sorting options
      isPasswordIncluded = false, // Exclude password by default
    } = options || {};

    // Convert string IDs to ObjectId
    Object.keys(matchCondition).forEach((key) => {
      if (typeof matchCondition[key] === 'string') {
        matchCondition[key] = new Types.ObjectId(matchCondition[key]);
      }
    });

    // Default user fields if none are specified
    let selectedUserFields = userFields.length ? userFields : ['_id', 'name', 'email'];

    // Ensure password is not included unless explicitly requested
    if (!isPasswordIncluded) {
      selectedUserFields = selectedUserFields.filter((field) => field !== 'password');
    }

    // Query vendor with filtering, sorting, and population
    const vendor = await Vendor.findOne({ ...matchCondition, ...filter })
      .select(vendorFields.length ? vendorFields.join(' ') : '') // Select vendor fields
      .populate({
        path: 'user',
        select: selectedUserFields.join(' '), // Select user fields
      })
      .sort(sort) // Apply sorting
      .exec();

    return vendor as unknown as PopulatedVendor | null;
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
