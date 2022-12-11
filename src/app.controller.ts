import { Controller, Get, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import Role from './authentication/enum/role.enum';
import RoleGuard from './authentication/guards/role.guard';
import { ShutdownService } from './shutdown.service';

@Controller()
export class AppController {
  constructor(
    private readonly shutdownService: ShutdownService,
    private readonly appService: AppService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('shutdown')
  @UseGuards(RoleGuard(Role.Admin))
  shutdown() {
    return this.shutdownService.shutdown();
  }
}
