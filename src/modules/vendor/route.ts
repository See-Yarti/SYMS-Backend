import { Router } from 'express';
import VendorsController from './controller';
import Validator from '@/middlewares/Validator';
import { VerifyVendorBody, VerifyVendorParam } from './dto';
import { UserRole } from '@/types/user.types';
import { paginationDTO } from '@/common/dto';

const vendorRouter = Router();
const vendorController = new VendorsController();
const validator = new Validator();

// Get All Vendors
vendorRouter.get(
  '/',
  validator.inputValidator({ dto: paginationDTO, target: 'query' }),
  vendorController.getAllVendors,
);
// Get Vendor Details from Vendor ID
vendorRouter.get(
  '/:vendorId',
  validator.inputValidator({ dto: VerifyVendorParam, target: 'params' }),
  vendorController.getVendorById,
);
// Verify Vendor 
vendorRouter.post(
  '/:vendorId/verify',
  validator.tokenValidator({ acceptRoles: [UserRole.admin] }),
  validator.inputValidator({ dto: VerifyVendorParam, target: 'params' }),
  validator.inputValidator({ dto: VerifyVendorBody, target: 'body' }),
  vendorController.verifyVendor,
);
// Delete the vendor
vendorRouter.delete(
  '/:vendorId',
  validator.tokenValidator({ acceptRoles: [UserRole.admin] }),
  validator.inputValidator({ dto: VerifyVendorParam, target: 'params' }),
  vendorController.deleteVendor
);

export default vendorRouter;
