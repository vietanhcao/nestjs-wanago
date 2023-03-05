import { IsArray, IsEnum, IsString } from 'class-validator';
import { FUNCTIONS } from 'src/service-rbac/common/constants/function.constant';

// export class ChangePasswordDto {
//   @IsString()
//   username: string;

//   @IsString()
//   passwordOld: string;

//   @IsString()
//   passwordNew: string;

//   @IsEnum(RbacUserTypes)
//   type: RbacUserTypes;

//   @IsString()
//   status: string;
// }

// export class ResetPasswordDto {
//   @IsString()
//   username: string;
// }

// export class UpdateFunctionsDto {
//   @IsString()
//   username: string;

//   @IsArray()
//   @IsEnum(FUNCTIONS, { each: true })
//   functions: string[];
// }

export class UpdateAccountFunctionsDto {
  @IsString()
  username: string;

  @IsArray()
  @IsEnum(FUNCTIONS, { each: true })
  functions: string[];
}

// export class UpdateRolesDto {
//   @IsString()
//   username: string;

//   @IsArray()
//   roles: string[];
// }

// export class ForgetPasswordDto {
//   @IsString()
//   password: string;

//   @IsString()
//   session: string;
// }

// export class RequestForgetPasswordDto {
//   @IsOptional()
//   @IsString()
//   username?: string;

//   @IsOptional()
//   @IsEmail()
//   email?: string;
// }

// export class LockAccountRbacDto {
//   @IsString()
//   username: string;

//   @IsEnum(RbacUserStatus)
//   status: RbacUserStatus;
// }
