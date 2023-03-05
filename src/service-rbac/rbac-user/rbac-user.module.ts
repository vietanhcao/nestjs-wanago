import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RbacUserController } from './rbac-user.controller';
import { RbacUserService } from './rbac-user.service';
import { RbacUser, RbacUserSchema } from './schema/rbac-user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: RbacUser.name, schema: RbacUserSchema },
    ]),
  ],
  controllers: [RbacUserController],
  providers: [RbacUserService],
  exports: [RbacUserService],
})
export class RbacUserModule {}
