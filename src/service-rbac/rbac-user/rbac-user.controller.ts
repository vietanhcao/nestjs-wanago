import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import JwtTwoFactorGuard from 'src/authentication/twoFactor/jwt-two-factor.guard';
import Resolve from 'src/common/helpers/Resolve';
import { UpdateAccountFunctionsDto } from './dtos/rbac-user.dto';
import { RbacUserService } from './rbac-user.service';

@Controller('user-rbac')
export class RbacUserController {
  constructor(private readonly rbacUserService: RbacUserService) {}

  @Post('account')
  @UseGuards(JwtTwoFactorGuard)
  async createAccountForDev(@Body() dto: { username: string; email: string }) {
    const { username, email } = dto;
    const result = await this.rbacUserService.createAccountForDev(
      username,
      email,
    );
    return Resolve.ok(0, 'Success', result);
  }
  @Post('account/function')
  @UseGuards(JwtTwoFactorGuard)
  async updateFunctionsForMember(@Body() dto: UpdateAccountFunctionsDto) {
    const result = await this.rbacUserService.updateFunctionsForAccount(dto);

    return Resolve.ok(0, 'Success', result);
  }

  @Get(':username')
  @UseGuards(JwtTwoFactorGuard)
  async findFunctionsRolesforUsername(
    @Param() { username }: { username: string },
  ) {
    return await this.rbacUserService.findFunctionsRolesforUsername(username);
  }

  @Get(':username')
  @UseGuards(JwtTwoFactorGuard)
  async validateRbacAccount(@Param() { username }: { username: string }) {
    return await this.rbacUserService.validateRbacAccount(username);
  }

  @Post()
  @UseGuards(JwtTwoFactorGuard)
  async validateRbacEmail(@Body() dto: { email: string }) {
    return await this.rbacUserService.validateRbacEmail(dto.email);
  }

  @Post()
  @UseGuards(JwtTwoFactorGuard)
  async lockAccount(@Body() dto) {
    return await this.rbacUserService.lockAccount(dto);
  }
}
