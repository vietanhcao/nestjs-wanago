import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import RequestWithUser from 'src/authentication/requestWithUser.interface';
import JwtTwoFactorGuard from 'src/authentication/twoFactor/jwt-two-factor.guard';
import { QueryParse } from 'src/common/client-query/client-query.type';
import Resolve from 'src/common/helpers/Resolve';
import ParamsWithId from 'src/utils/paramsWithId';
import { ApproveCategoryService } from './approve-category.service';
import { ApproveActionDto, ApprovedDto } from './dto';
import { ServiceApproveService } from './service-approve.service';
import { ApproveActions, ApproveConfigs } from './types';

@Controller('approve')
export class ServiceApproveController {
  constructor(
    private readonly approveModel: ServiceApproveService,
    private readonly approveCategory: ApproveCategoryService,
  ) {}
  @Get()
  @UseGuards(JwtTwoFactorGuard)
  async getAllApprove(@Query() query: QueryParse) {
    const { result, pagination } = await this.approveModel.findAll(query);
    return Resolve.ok(0, 'Success', result, { pagination });
  }

  /**
   * Phê duyệt yêu cầu phê duyệt
   * @param dto
   * @returns
   */
  @Post(':id')
  @UseGuards(JwtTwoFactorGuard)
  async approved(
    @Param() { id }: ParamsWithId,
    @Req() req: RequestWithUser,
    @Body() body: ApprovedDto,
  ) {
    const _body = {
      ...body,
      approveId: id.toString(),
      modifiedBy: req.user._id.toString(),
    };
    await this.approveModel.approved(_body);
    return Resolve.ok(0, 'Success');
  }

  /**
   * Lắng nghe yêu cầu phê duyệt tạo category
   * @param dto
   * @returns
   */
  @OnEvent(ApproveConfigs[ApproveActions.CREATE_CATEGORY].accepted, {
    async: true,
    promisify: true, // thêm option này để có thể await throw exception
  })
  createCategoryApproved(dto: ApproveActionDto) {
    console.log('Message Received: ', dto);
    return this.approveCategory.createCategoryApproved(
      dto,
      ApproveActions.CREATE_CATEGORY,
    );
  }
}
