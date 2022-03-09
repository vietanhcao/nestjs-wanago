import { CanActivate, ExecutionContext, mixin, Type } from '@nestjs/common';
import RequestWithUser from '../requestWithUser.interface';
import JwtAuthenticationGuard from '../token/jwt-authentication.guard';
import Permission from 'src/authentication/enum/permission.enum';
import Role from '../enum/role.enum';

const PermissionGuard = (permission: Permission): Type<CanActivate> => {
  class PermissionGuardMixin extends JwtAuthenticationGuard {
    async canActivate(context: ExecutionContext) {
      await super.canActivate(context);

      const request = context.switchToHttp().getRequest<RequestWithUser>();
      const user = request.user;
      if (user?.role === Role.Admin) {
        return true;
      }
      return user?.permissions?.includes(permission);
    }
  }

  return mixin(PermissionGuardMixin);
};

export default PermissionGuard;
