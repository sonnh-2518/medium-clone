import { Module } from '@nestjs/common';
import { SchedulerWorkerService } from './scheduler-worker.service';

@Module({
  providers: [SchedulerWorkerService],
})
export class SchedulerModule {}
