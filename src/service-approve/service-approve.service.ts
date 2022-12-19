import { Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectModel } from '@nestjs/mongoose';
import * as assert from 'assert';
import { Model } from 'mongoose';
import ClientQuery from 'src/common/client-query/client-query';
import { QueryParse } from 'src/common/client-query/client-query.type';
import { ApproveActionDto, ApproveCreateDto } from './dto';
import { ApproveDocument } from './schema/approve.schema';
import {
  ApproveActions,
  ApproveConfigs,
  ApproveStatus,
  IApproved,
} from './types';

@Injectable()
export class ServiceApproveService {
  constructor(
    @InjectModel(ApproveDocument.name)
    private readonly approveModel: Model<ApproveDocument>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * A method that fetches the approve from the database
   * @returns A promise with the list of approve
   */
  async findAll(query: QueryParse) {
    const client = new ClientQuery(this.approveModel);
    const response = await client.findForQuery(query, {
      populate: { path: 'createdBy', select: 'email firstName lastName' },
    });

    return { ...response, result: response.hits };
  }

  /**
   * Khởi tạo yêu cầu phê duyệt
   * @param dto
   * @returns
   */
  async create(dto: ApproveCreateDto) {
    return await this.approveModel.create(dto);
  }

  /**
   * Phê duyệt các trạng thái của category
   * @param dto
   */
  async approved(dto: IApproved) {
    const { approveId, action, modifiedBy } = dto;
    const config = ApproveConfigs[action];
    const message = { approveId, modifiedBy } as ApproveActionDto;

    // emit event
    await this.eventEmitter.emitAsync(config.accepted, message);
    return true;
  }

  // todo rejected...

  /**
   * Tìm yêu cầu phê duyệt đang có trạng thái pending bằng id
   * @param id
   * @returns
   */
  async findApprovePendingForAction(id: string, action: ApproveActions) {
    const approve = await this.approveModel.findOne({
      _id: id,
      action: action,
      status: ApproveStatus.PENDING,
    });
    assert.ok(
      approve,
      new NotFoundException('Không tìm thấy yêu cầu phê duyệt'),
    );

    return approve;
  }
}
