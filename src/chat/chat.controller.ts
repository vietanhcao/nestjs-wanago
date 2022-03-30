import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import Role from 'src/authentication/enum/role.enum';
import RoleGuard from 'src/authentication/guards/role.guard';
import Resolve from 'src/common/helpers/Resolve';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get()
  @UseGuards(RoleGuard(Role.User))
  async getAllMessages(@Query() { skip, limit, id_lt }) {
    const { result, pagination } = await this.chatService.getAllMessages(
      skip,
      limit,
      id_lt,
    );
    return Resolve.ok(0, 'Success', result, { pagination });
  }
}
