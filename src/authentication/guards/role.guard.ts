import { CanActivate, ExecutionContext, mixin, Type } from '@nestjs/common';
import RequestWithUser from '../requestWithUser.interface';
import Role from '../../authentication/enum/role.enum';
import JwtTwoFactorGuard from '../twoFactor/jwt-two-factor.guard';

const RoleGuard = (role: Role): Type<CanActivate> => {
  class RoleGuardMixin extends JwtTwoFactorGuard {
    async canActivate(context: ExecutionContext) {
      // check previous guard
      await super.canActivate(context);

      const request = context.switchToHttp().getRequest<RequestWithUser>();
      const user = request.user;
      if (user?.role === Role.Admin) {
        return true;
      }

      return user?.role?.includes(role);
    }
  }

  return mixin(RoleGuardMixin);
};

export default RoleGuard;
