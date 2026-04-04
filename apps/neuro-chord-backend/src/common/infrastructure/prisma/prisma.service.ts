import { Injectable, type OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor(config: ConfigService) {
    const url = config.get("POSTGRES_DB_URL");

    if (!url) {
      throw new Error("POSTGRES_DB_URL is not defined in .env file");
    }

    const pool = new Pool({
      connectionString: url,
    });

    const adapter = new PrismaPg(pool);

    super({
      adapter,
      log: ["query", "info", "warn", "error"],
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      console.log("Successfully connected to PostgreSQL via Prisma Adapter");
    } catch (e) {
      console.error("Prisma connection error:", e);
    }
  }
}
