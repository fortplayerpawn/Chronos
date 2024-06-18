import { Repository, EntityMetadata, DataSource, type Logger } from "typeorm";
import { config, logger } from "..";
import { LoggerFactory } from "typeorm/logger/LoggerFactory.js";
import { User } from "../tables/user";
import { Account } from "../tables/account";
import { Tokens } from "../tables/tokens";
import { Timeline } from "../tables/timeline";
import { Contentpages } from "../tables/contentpages";

interface DatabaseConfig {
  connectionString?: string;
  ssl?: boolean;
}

export default class Database {
  private connection!: DataSource;
  private repositories: Record<string, Repository<any>> = {};

  constructor(private dbConfig: DatabaseConfig = {}) {}

  public async connect() {
    try {
      this.connection = new DataSource({
        type: "postgres",
        url: this.dbConfig.connectionString || config.databaseUrl,
        ssl: this.dbConfig.ssl ? { rejectUnauthorized: false } : false,
        entities: [User, Account, Tokens, Timeline, Contentpages],
        synchronize: true,
        logging: ["query", "schema", "error", "warn", "info"],
      });

      await this.connection.initialize();

      const entityMetadatas = this.connection.entityMetadatas;

      for (const metadata of entityMetadatas) {
        const repository = this.connection.getRepository(metadata.name);
        this.repositories[metadata.name] = repository;
      }

      logger.startup("Connected to Database.");
    } catch (error) {
      logger.error(`Error connecting to database: ${error}`);
    }
  }

  public async disconnect() {
    try {
      await this.connection.close();
      logger.startup("Disconnected from Database.");
    } catch (error) {
      logger.error(`Error disconnecting from database: ${error}`);
    }
  }

  public getRepository(entityName: string): Repository<any> {
    return this.connection.getRepository(entityName);
  }
}
