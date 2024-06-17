import type { Repository } from "typeorm";
import Database from "../Database.wrapper";
import { logger } from "../..";
import type { Account } from "../../tables/account";
import type { ProfileId } from "../../utilities/responses";
import NodeCache from "node-cache";

const cache = new NodeCache({ stdTTL: 600 });

export default class AccountService {
  private accountRepository: Repository<Account>;

  constructor(private database: Database) {
    this.accountRepository = this.database.getRepository("account");
  }

  public async findUserByAccountId(accountId: string): Promise<Account | null> {
    try {
      return await this.accountRepository.findOne({ where: { accountId } });
    } catch (error) {
      logger.error(`Error finding account: ${error}`);
      return null;
    }
  }

  public async findUserByDiscordId(discordId: string): Promise<Account | null> {
    try {
      return await this.accountRepository.findOne({ where: { discordId } });
    } catch (error) {
      logger.error(`Error finding account: ${error}`);
      return null;
    }
  }

  public async create(account: Partial<Account>): Promise<Account | null> {
    try {
      const newAccount = this.accountRepository.create(account);
      await this.accountRepository.save(newAccount);
      return newAccount;
    } catch (error) {
      logger.error(`Error creating account: ${error}`);
      return null;
    }
  }

  public async incrementRevision(accountId: string, type: ProfileId): Promise<Account | null> {
    try {
      let accountToUpdate = cache.get<Account>(accountId);

      if (!accountToUpdate) {
        accountToUpdate = (await this.accountRepository.findOne({
          where: { accountId },
        })) as Account;

        if (!accountToUpdate) {
          logger.error(`Account with accountId ${accountId} not found.`);
          return null;
        }

        cache.set(accountId, accountToUpdate);
      }

      if (!(type in accountToUpdate)) {
        logger.error(`Profile with type ${type} not found in account.`);
        return null;
      }

      // @ts-ignore
      const profile = accountToUpdate[type];
      profile.rvn = (profile.rvn || 0) + 1;
      profile.commandRevision = (profile.commandRevision || 0) + 1;
      profile.updatedAt = new Date().toISOString();

      const updatedAccount = await this.accountRepository.save(accountToUpdate);

      cache.set(accountId, updatedAccount);

      return updatedAccount;
    } catch (error) {
      logger.error(`Error incrementing revision: ${error}`);
      return null;
    }
  }
}
