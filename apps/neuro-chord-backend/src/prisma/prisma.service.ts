import { Injectable, type OnModuleInit } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import { Pool } from 'pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    // 1. Upewnij się, że zmienne środowiskowe są załadowane
    dotenv.config();

    // 2. Stwórz Pool z biblioteki 'pg'
    const pool = new Pool({
      connectionString: process.env.POSTGRES_DB_URL,
    });

    // 3. Przekaż Pool do adaptera Prismy
    const adapter = new PrismaPg(pool);

    // 4. Przekaż adapter do konstruktora PrismaClient
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }
}
