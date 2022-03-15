import { Module } from '@nestjs/common';
import { OptimizeController } from './optimize.controller';
import { BullModule } from '@nestjs/bull';
import { join } from 'path';
import { ImageProcessor } from './optimize.processor';
import { AudioProcessor } from './audio.processor';
import { AudioController } from './audio.controller';
// import imageProcessor from './image.processor';

@Module({
  imports: [
    BullModule.registerQueue(
      {
        name: 'image',
        processors: [
          {
            name: 'optimize',
            path: join(__dirname, 'image.processor.js'),
          },
        ],
        limiter: {
          max: 1000,
          duration: 60000,
        },
      },
      {
        name: 'audio',
        // defaultJobOptions: {
        //   removeOnComplete: true,
        //   removeOnFail: true,
        //   backoff: 1000,
        // },
        limiter: {
          max: 1000,
          duration: 60000,
        },
      },
    ),
  ],
  providers: [AudioProcessor],
  exports: [],
  controllers: [OptimizeController, AudioController],
})
export class OptimizeModule {}
