import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import JwtTwoFactorGuard from 'src/authentication/twoFactor/jwt-two-factor.guard';
import { QueryParse } from 'src/common/client-query/client-query.type';
import Resolve from 'src/common/helpers/Resolve';
import { ApprovedDto } from './dto';
import { ServiceApproveService } from './service-approve.service';

@Controller('service-approve')
export class ServiceApproveController {
  constructor(private readonly approveModel: ServiceApproveService) {}
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
  async approved(dto: ApprovedDto) {
    return await this.approveModel.approved(dto);
  }
}
