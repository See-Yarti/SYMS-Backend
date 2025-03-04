import { IsString } from 'class-validator';

export class VerifyVendorParam {
  @IsString()
  vendorId: string;
}

export class VerifyVendorBody {
  @IsString()
  password: string;
}