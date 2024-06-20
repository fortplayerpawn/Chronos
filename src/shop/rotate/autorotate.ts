import cron from "node-cron";
import { logger } from "../..";
import { ShopGenerator } from "../shop";

export default function rotate() {
  const currentDate = new Date();

  currentDate.setUTCHours(0, 0, 0, 0);
  currentDate.setUTCDate(currentDate.getUTCDate() + 1);

  const date = currentDate.toISOString();
  logger.info(`A new storefront gets generated at ${date}`);

  cron.schedule("0 0 * * *", async () => await ShopGenerator.generate());
}
