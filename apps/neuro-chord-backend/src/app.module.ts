import { AuthModule } from "@auth/auth.module";
import { AllExceptionsFilter } from "@filters/all-exceptions.filter";
import { AuthGuard } from "@guards/auth.guard";
import { MetadataInterceptor } from "@interceptors/metadata.interceptor";
import { MailerModule } from "@mailer/mailer.module";
import { MailerModule as NestMailerModule } from "@nestjs-modules/mailer";
import { HandlebarsAdapter } from "@nestjs-modules/mailer/adapters/handlebars.adapter";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from "@nestjs/core";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { JwtModule } from "@nestjs/jwt";
import { PrismaModule } from "@prisma/prisma.module";
import { RedisModule } from "@redis/redis.module";
import { StatsModule } from "@stats/stats.module";
import {
  makeCounterProvider,
  PrometheusModule,
} from "@willsoto/nestjs-prometheus";
import { LoggerModule } from "nestjs-pino";
import { join } from "node:path";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { SecurityModule } from "./common/infrastructure/security/security.module";
import { SecurityService } from "./common/infrastructure/security/security.service";
@Module({
  imports: [
    JwtModule,
    PrometheusModule.register({
      path: "/metrics",
    }),
    NestMailerModule.forRoot({
      transport: {
        host: "localhost",
        port: 1025,
        auth: {
          user: "",
          pass: "",
        },
      },
      defaults: {
        from: "No reply <no-reply@example.com>",
      },
      template: {
        dir: join(process.cwd(), "src", "templates"),
        options: {
          strict: true,
        },
        adapter: new HandlebarsAdapter(),
      },
    }),
    EventEmitterModule.forRoot(),
    LoggerModule.forRoot({
      pinoHttp: {
        transport:
          process.env.NODE_ENV !== "production"
            ? {
                target: "pino-pretty",
                options: {
                  colorize: true,
                  translateTime: "SYS:standard",
                  singleLine: true,
                  levelFirst: true,
                },
              }
            : undefined,
      },
    }),
    StatsModule,
    PrismaModule,
    MailerModule,
    RedisModule,
    AuthModule,
    ConfigModule.forRoot({ isGlobal: true }),
    SecurityModule,
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
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    { provide: APP_GUARD, useClass: AuthGuard },
    { provide: APP_INTERCEPTOR, useClass: MetadataInterceptor },
    makeCounterProvider({
      name: "mongo_errors_total",
      help: "Total number of MongoDB errors",
      labelNames: ["event_name", "error_code"],
    }),
    makeCounterProvider({
      name: "http_errors_total",
      help: "Total number of HTTP errors",
      labelNames: ["status", "method", "path"],
    }),
    SecurityService,
  ],
})
export class AppModule {}
