import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import CategoriesModule from 'src/categories/categories.module';
import { ApproveCategoryService } from './approve-category.service';
import { ApproveDocument, ApproveSchema } from './schema/approve.schema';
import { ServiceApproveController } from './service-approve.controller';
import { ServiceApproveService } from './service-approve.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ApproveDocument.name, schema: ApproveSchema },
    ]),
    forwardRef(() => CategoriesModule),
  ],
  controllers: [ServiceApproveController],
  providers: [ServiceApproveService, ApproveCategoryService],
  exports: [ServiceApproveService, ApproveCategoryService],
})
export class ServiceApproveModule {}
