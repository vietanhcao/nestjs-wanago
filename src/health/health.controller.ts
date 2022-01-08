import { Controller, Get } from '@nestjs/common';
import {
  HealthCheckService,
  HealthCheck,
  MongooseHealthIndicator,
  MemoryHealthIndicator,
  DiskHealthIndicator,
} from '@nestjs/terminus';

@Controller('health')
class HealthController {
  constructor(
    private healthCheckService: HealthCheckService,
    private MongooseHealthIndicator: MongooseHealthIndicator,
    private memoryHealthIndicator: MemoryHealthIndicator,
    private diskHealthIndicator: DiskHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.healthCheckService.check([
      () => this.MongooseHealthIndicator.pingCheck('database'),
      // the process should not use more than 400MB memory
      () =>
        this.memoryHealthIndicator.checkHeap('memory heap', 400 * 1024 * 1024),
      // The process should not have more than 400MB RSS memory allocated
      () =>
        this.memoryHealthIndicator.checkRSS('memory RSS', 400 * 1024 * 1024),
      // the used disk storage should not exceed the 50% of the available space
      () =>
        this.diskHealthIndicator.checkStorage('disk health', {
          thresholdPercent: 0.95,
          path: '/',
        }),
    ]);
  }
}

export default HealthController;
