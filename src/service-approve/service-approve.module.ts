import { Module } from '@nestjs/common';
import { ServiceApproveController } from './service-approve.controller';
import { ServiceApproveService } from './service-approve.service';

@Module({
  controllers: [ServiceApproveController],
  providers: [ServiceApproveService],
})
export class ServiceApproveModule {}
