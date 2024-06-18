import { In, type Repository } from "typeorm";
import type { Contentpages } from "../../tables/contentpages";
import type Database from "../Database.wrapper";
import { logger } from "../..";

export default class ContentPagesServie {
  private contentRepository: Repository<Contentpages>;

  constructor(private database: Database) {
    this.contentRepository = this.database.getRepository("contentpages");
  }

  public async findMany(stages: string, keys: string[]) {
    try {
      return await this.contentRepository.find({ where: { stage: stages, key: In(keys) } });
    } catch (error) {
      return null;
    }
  }

  public async findOne(stage: string, key: string) {
    try {
      return await this.contentRepository.findOne({ where: { stage, key } });
    } catch (error) {
      return null;
    }
  }

  public async findAll() {
    try {
      return await this.contentRepository.find();
    } catch (error) {
      return null;
    }
  }

  public async create(contentpage: Partial<Contentpages>): Promise<Contentpages | null> {
    try {
      const newPage = this.contentRepository.create(contentpage);
      await this.contentRepository.save(newPage);
      return newPage;
    } catch (error) {
      logger.error(`Error creating contentpage: ${error}`);
      return null;
    }
  }
}
