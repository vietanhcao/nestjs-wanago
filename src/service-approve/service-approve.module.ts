import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ApproveDocument, ApproveSchema } from './schema/approve.schema';
import { ServiceApproveController } from './service-approve.controller';
import { ServiceApproveService } from './service-approve.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ApproveDocument.name, schema: ApproveSchema },
    ]),
  ],
  controllers: [ServiceApproveController],
  providers: [ServiceApproveService],
  exports: [ServiceApproveService],
})
export class ServiceApproveModule {}
