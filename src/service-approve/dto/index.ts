import {
  IsEnum,
  IsMongoId,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { AnyObject } from 'mongoose';
import { ApproveActions } from '../types';

export class ApproveCreateDto {
  @IsString()
  createdBy: string;

  @IsEnum(ApproveActions)
  action: ApproveActions;

  @IsOptional()
  @IsObject()
  oldData?: AnyObject;

  @IsOptional()
  @IsObject()
  newData?: AnyObject;
}

export class ApprovedDto {
  @IsString()
  @IsEnum(ApproveActions)
  action: ApproveActions;
}

export class RejectedDto {
  @IsString()
  @IsEnum(ApproveActions)
  action: ApproveActions;

  @IsString()
  rejectedReason: string;
}

export class ApproveActionDto {
  @IsMongoId()
  approveId: string;

  @IsString()
  modifiedBy: string;

  @IsOptional() // danhf cho truong hop reject
  @IsString()
  rejectedReason?: string;
}
