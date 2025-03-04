import { Router } from 'express';
import VendorsController from './controller';
import Validator from '@/middlewares/Validator';
import { VerifyVendorBody, VerifyVendorParam } from './dto';
import { UserRole } from '@/types/user.types';

const vendorRouter = Router();
const vendorController = new VendorsController();
const validator = new Validator();

vendorRouter.get('/', vendorController.getVendorDetails);
vendorRouter.post(
  '/:vendorId/verify',
  // validator.tokenValidator({ acceptRoles: [UserRole.admin] }),
  validator.inputValidator({ dto: VerifyVendorParam, target: 'params' }),
  validator.inputValidator({ dto: VerifyVendorBody, target: 'body' }),
  vendorController.verifyVendor,
);

export default vendorRouter;
