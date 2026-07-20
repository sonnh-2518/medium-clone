import { parentPort, threadId } from 'worker_threads';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SchedulerWorkerModule } from './scheduler-worker.module';
import { SHUTDOWN_MESSAGE } from './worker-messages';

async function bootstrap(): Promise<void> {
  const logger = new Logger('SchedulerWorker');
  const app = await NestFactory.createApplicationContext(SchedulerWorkerModule);

  logger.log(`Scheduler worker started on thread #${threadId}`);

  parentPort?.on('message', (message: unknown) => {
    if (message === SHUTDOWN_MESSAGE) {
      void app
        .close()
        .catch((error: Error) =>
          logger.error(`Error while closing worker app: ${error.message}`),
        )
        .finally(() => process.exit(0));
    }
  });
}

void bootstrap();
