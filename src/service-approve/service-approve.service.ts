import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import ClientQuery from 'src/common/client-query/client-query';
import { QueryParse } from 'src/common/client-query/client-query.type';
import { ApproveActionDto, ApproveCreateDto, ApprovedDto } from './dto';
import { ApproveDocument } from './schema/approve.schema';
import { ApproveConfigs } from './types';

@Injectable()
export class ServiceApproveService {
  constructor(
    @InjectModel(ApproveDocument.name)
    private readonly approveModel: Model<ApproveDocument>,
  ) {}

  /**
   * A method that fetches the approve from the database
   * @returns A promise with the list of approve
   */
  async findAll(query: QueryParse) {
    const client = new ClientQuery(this.approveModel);
    const response = await client.findForQuery(query, {
      populate: { path: 'author', select: '-password' },
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
  async approved(dto: ApprovedDto) {
    const { approveId, action, modifiedBy } = dto;
    const config = ApproveConfigs[action];
    const message = { approveId, modifiedBy } as ApproveActionDto;

    console.log('config', config);
    console.log('message', message);

    // todo Call event để xác nhận phê duyệt theo action
    // todo  update createBy echema approve
    // how to call event

    // return callback;
  }
}
