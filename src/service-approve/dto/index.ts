import {
  IsEnum,
  IsMongoId,
  IsNotEmpty,
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
  @IsMongoId()
  approveId: string;

  @IsString()
  modifiedBy: string;

  @IsString()
  @IsEnum(ApproveActions)
  action: ApproveActions;
}

export class ApproveActionDto {
  @IsMongoId()
  approveId: string;

  @IsString()
  @IsNotEmpty()
  modifiedBy: string;
}