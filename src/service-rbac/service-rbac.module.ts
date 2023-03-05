import { Module } from '@nestjs/common';
import { RbacUserModule } from './rbac-user/rbac-user.module';

@Module({
  imports: [RbacUserModule],
})
export class RBACModule {}
