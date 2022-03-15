import {
  InjectQueue,
  OnGlobalQueueCompleted,
  OnGlobalQueueProgress,
  Process,
  Processor,
} from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import { Job, Queue } from 'bull';

@Injectable()
@Processor('audio')
export class AudioProcessor {
  private readonly logger = new Logger(AudioProcessor.name);
  constructor(@InjectQueue('audio') private readonly imageQueue: Queue) {}
  @OnGlobalQueueCompleted()
  async onGlobalCompleted(jobId: number, result: any) {
    const job = await this.imageQueue.getJob(jobId);
    console.log('(Global) on completed: job ', job.id, ' -> result: ', result);
  }

  @OnGlobalQueueProgress()
  async OnGlobalProgress(jobId: number, result: any) {
    const job = await this.imageQueue.getJob(jobId);
    console.log('(Global) on completed: job ', job.id, ' -> result: ', result);
  }

  @Process('transcode')
  async handleTranscode(job: Job) {
    this.logger.debug('Start transcoding...');
    this.logger.debug(job.data);
    this.logger.debug('Transcoding completed');
    let progress = 0;
    for (let i = 0; i < 100; i++) {
      // await doSomething(job.data);
      progress += 10;
      await job.progress(progress);
    }
    return {};
  }
}
