
import { Module } from '@nestjs/common';
import { makeCounterProvider } from '@willsoto/nestjs-prometheus';

@Module({
  providers: [
    makeCounterProvider({
      name: 'mongo_errors_total',
      help: 'Liczba błędów podczas zapisu statystyk do MongoDB',
      labelNames: ['error_type'],
    }),
  ],
})
export class StatsModule {}