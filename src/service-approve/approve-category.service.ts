import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as _ from 'lodash';
import { Model } from 'mongoose';
import CategoriesService from 'src/categories/categories.service';
import { ApproveActionDto } from './dto';
import { ApproveDocument } from './schema/approve.schema';
import { ServiceApproveService } from './service-approve.service';
import { ApproveActions, ApproveStatus } from './types';

@Injectable()
export class ApproveCategoryService {
  constructor(
    @InjectModel(ApproveDocument.name)
    private readonly approveModel: Model<ApproveDocument>,
    private readonly approveService: ServiceApproveService,
    private readonly categoryService: CategoriesService,
  ) {}

  /**
   * Phê duyệt tạo thông tin category
   * @param dto
   * @returns
   */
  async createCategoryApproved(dto: ApproveActionDto, action: ApproveActions) {
    const approve = await this.approveService.findApprovePendingForAction(
      dto.approveId,
      action,
    );
    // Cập nhật thông tin phê duyệt
    const newDataApprove = {
      status: ApproveStatus.APPROVED,
      acceptedAt: new Date(),
      acceptedBy: dto.modifiedBy,
    };
    await this.approveModel.findByIdAndUpdate(approve._id, newDataApprove, {
      new: true,
    });

    //- Gọi sang service để cập nhật thông tin category
    const { _id } = approve.newData || {};
    await this.categoryService.approvalCategoryCreate(
      _id as string,
      approve.newData,
    );
    return _.pick(approve, ['_id', 'action', 'status']);
  }
}
