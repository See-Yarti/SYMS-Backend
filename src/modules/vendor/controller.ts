import { asyncWrapper } from '@/utils/asyncWrapper';
import { BadRequestError } from '@/utils/errors';
import { Request } from 'express';
import { VerifyVendorBody, VerifyVendorParam } from './dto';
import VendorService from '@/services/vendor.service';
import successResponse from '@/utils/SuccessResponse';
import CryptoService from '@/services/crypto.service';
import UserService from '@/services/user.service';
import Vendor from '@/models/vendor.model';
import { PopulatedVendor } from '@/types/user.types';
import { paginationDTO } from '@/common/dto';

class VendorController {
  private vendorService: VendorService = new VendorService();
  private cryptoService: CryptoService = new CryptoService();
  private userService: UserService = new UserService();
  // Methods
  // Get all vendors
  public getAllVendors = asyncWrapper(async (request: Request) => {
    const { limit, page } = request.query as unknown as paginationDTO;
    const vendors = await this.vendorService.getVendors({
      userFields: ['_id', 'email', 'name'],
      vendorFields: ['_id', 'companyName', 'isVendorVerified'],
      limit,
      page,
    });
    const countVendors = await Vendor.countDocuments();
    const response = {
      vendors: vendors,
      pagination: {
        total: countVendors,
        currentPage: page,
        hasNextPage: page < Math.ceil(countVendors / limit),
        hasPrevPage: page > 1,
      },
    };
    return new successResponse(response, 'Vendors fetched successfully', true, 200);
  });
  // Get vendor details
  public getVendorById = asyncWrapper(async (request: Request) => {
    const { vendorId } = request.params;
    const vendor = await this.vendorService.getVendorById(vendorId);
    if (!vendor) {
      throw new BadRequestError('Vendor not found', 404);
    }
    return new successResponse(vendor, 'Vendor fetched successfully', true, 200);
  });
  // Verify the vendor by admin
  public verifyVendor = asyncWrapper(async (request: Request) => {
    // const adminUser = request.user;
    const { vendorId } = request.params as unknown as VerifyVendorParam;
    const { password } = request.body as VerifyVendorBody;
    // if (!adminUser) {
    //   throw new BadRequestError('Unauthorized Request - Role not permitted', 400);
    // }

    // Check the vendor are exist or not

    let vendor = await this.vendorService.getVendorById(vendorId);

    if (!vendor) {
      throw new BadRequestError('Vendor not found', 404);
    }

    // Verify vendor using vendorID and new password
    vendor = await this.vendorService.verifyVendor(vendor.id);

    if (!vendor) {
      throw new BadRequestError('Vendor Verification Failed', 400);
    }

    // Encrypt the new password
    const encryptedPassword = this.cryptoService.encrypt(password);

    // Set a new password for the vendor and isDummyPassword set to false and save the vendor
    await this.userService.updateUserFields({
      userId: vendor.user.id,
      updateData: { password: encryptedPassword },
    });

    // Return success response
    return new successResponse(vendor, 'Vendor Verification Successful');
  });
  // Delete the vendor
  public deleteVendor = asyncWrapper(async (request: Request) => {
    const { vendorId } = request.params as unknown as VerifyVendorParam;
    const vendor = await this.vendorService.getVendorById(vendorId);
    if (!vendor) {
      throw new BadRequestError('Vendor not found', 404);
    }
    await this.vendorService.deleteVendor(vendor.id);
    return new successResponse(null, 'Vendor deleted successfully', true, 200);
  });
}

export default VendorController;
