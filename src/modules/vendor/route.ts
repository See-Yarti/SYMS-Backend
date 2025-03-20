import { Router } from 'express';
import VendorsController from './controller';
import Validator from '@/middlewares/Validator';
import { VerifyVendorBody, VerifyVendorParam } from './dto';
import { UserRole } from '@/types/user.types';
import { paginationDTO } from '@/common/dto';

const vendorRouter = Router();
const vendorController = new VendorsController();
const validator = new Validator();

vendorRouter.get(
  '/',
  validator.inputValidator({ dto: paginationDTO, target: 'query' }),
  vendorController.getAllVendors,
);
vendorRouter.get(
  '/:vendorId',
  validator.inputValidator({ dto: VerifyVendorParam, target: 'params' }),
  vendorController.getVendorById,
);
vendorRouter.post(
  '/:vendorId/verify',
  validator.tokenValidator({ acceptRoles: [UserRole.admin] }),
  validator.inputValidator({ dto: VerifyVendorParam, target: 'params' }),
  validator.inputValidator({ dto: VerifyVendorBody, target: 'body' }),
  vendorController.verifyVendor,
);

export default vendorRouter;
