import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { makeCounterProvider } from '@willsoto/nestjs-prometheus';
import { MongoService } from './mongo.service';
import { UserStats, UserStatsSchema } from './schemas/user-stats.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: UserStats.name, schema: UserStatsSchema }]),
  ],
  providers: [
    MongoService,
    makeCounterProvider({
      name: 'mongodb_events_errors_total',
      help: 'Total number of errors in MongoDB event listeners',
      labelNames: ['event_name', 'error_code'],
    }),
  ],
})
export class MongoModule {}