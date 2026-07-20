import { once } from 'events';
import * as path from 'path';
import { setTimeout as delay } from 'timers/promises';
import { Worker } from 'worker_threads';
import {
  Injectable,
  Logger,
  OnApplicationBootstrap,
  OnApplicationShutdown,
} from '@nestjs/common';
import { SHUTDOWN_MESSAGE } from './worker/worker-messages';

const SHUTDOWN_TIMEOUT_MS = 5000;

@Injectable()
export class SchedulerWorkerService
  implements OnApplicationBootstrap, OnApplicationShutdown
{
  private readonly logger = new Logger(SchedulerWorkerService.name);
  private worker?: Worker;

  onApplicationBootstrap(): void {
    this.worker = new Worker(
      path.join(__dirname, 'worker', 'scheduler.worker.js'),
    );

    this.worker.on('online', () => {
      this.logger.log(
        `Scheduler worker online (thread #${this.worker?.threadId})`,
      );
    });

    this.worker.on('error', (error: Error) => {
      this.logger.error(`Scheduler worker error: ${error.message}`);
    });

    this.worker.on('exit', (code: number) => {
      this.logger.log(`Scheduler worker exited with code ${code}`);
      this.worker = undefined;
    });
  }

  async onApplicationShutdown(): Promise<void> {
    if (!this.worker) {
      return;
    }

    this.worker.postMessage(SHUTDOWN_MESSAGE);

    const exited = await Promise.race([
      once(this.worker, 'exit').then(() => true),
      delay(SHUTDOWN_TIMEOUT_MS).then(() => false),
    ]);

    if (!exited) {
      this.logger.warn('Scheduler worker did not exit in time, terminating');
      await this.worker?.terminate();
    }
  }
}
