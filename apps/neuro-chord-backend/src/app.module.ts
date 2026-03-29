import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/adapters/handlebars.adapter';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { makeCounterProvider, PrometheusModule } from '@willsoto/nestjs-prometheus';
import { LoggerModule } from 'nestjs-pino';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { PrismaExceptionFilter } from './common/filters/prisma-exception-filter';
import { PrismaModule } from './prisma/prisma.module';
import { StatsModule } from './stats/stats.module';
@Module({
  imports: [
    PrometheusModule.register({
      path: '/metrics',
    }),
    MailerModule.forRoot({
      transport: {
        host: 'audio-app-mailpit',
        port: 1025,
        auth: {
          user: '',
          pass: '',
        },
      },
      defaults: {
        from: 'No reply <no-reply@example.com>',
      },
      template: {
        adapter: new HandlebarsAdapter(),
      },
    }),
    EventEmitterModule.forRoot(),
    LoggerModule.forRoot({
      pinoHttp: {
        transport:
          process.env.NODE_ENV !== 'production'
            ? {
                target: 'pino-pretty',
                options: {
                  colorize: true,
                  translateTime: 'SYS:standard',
                  singleLine: true,
                  levelFirst: true,
                },
              }
            : undefined,
      },
    }),
    StatsModule,
    PrismaModule,
    AuthModule,
    ConfigModule.forRoot({ isGlobal: true }),
    // MongooseModule.forRootAsync({
    //   inject: [ConfigService],
    //   useFactory: (configService: ConfigService) => ({
    //     uri: configService.get<string>('MONGODB_URL') || 'mongodb://localhost:27017',
    //     auth: {
    //       username: configService.get<string>('MONGODB_INITDB_ROOT_USERNAME'),
    //       password: configService.get<string>('MONGODB_INITDB_ROOT_PASSWORD'),
    //     },
    //     authSource: 'admin',
    //   }),
    // }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_FILTER, useClass: PrismaExceptionFilter },
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    makeCounterProvider({
      name: 'mongo_errors_total',
      help: 'Total number of MongoDB errors',
      labelNames: ['event_name', 'error_code'],
    }),
    makeCounterProvider({
      name: 'http_errors_total',
      help: 'Total number of HTTP errors',
      labelNames: ['status', 'method', 'path'],
    }),
  ],
})
export class AppModule {}
