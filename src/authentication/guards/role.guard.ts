import { CanActivate, ExecutionContext, mixin, Type } from '@nestjs/common';
import RequestWithUser from '../requestWithUser.interface';
import JwtAuthenticationGuard from '../token/jwt-authentication.guard';
import Role from 'src/authentication/enum/role.enum';

const RoleGuard = (role: Role): Type<CanActivate> => {
  class RoleGuardMixin extends JwtAuthenticationGuard {
    async canActivate(context: ExecutionContext) {
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
