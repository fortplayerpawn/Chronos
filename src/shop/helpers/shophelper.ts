import type {
  BattlePassStorefront,
  Entries,
  ItemGrants,
  Shop,
  StorefrontNames,
  Storefronts,
} from "../interfaces/Declarations";
import { v4 as uuid } from "uuid";
import { createBattlePassEntryTemplate } from "./template";

export namespace ShopHelper {
  export function createShop(): Shop {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setUTCDate(today.getUTCDate() + 1);

    return {
      expiration: tomorrow.toISOString(),
      refreshIntervalHrs: 1,
      dailyPurchaseHrs: 24,
      storefronts: [],
    };
  }

  export function createStorefront(shop: Shop, sectionName: string): Storefronts {
    shop.storefronts.push({
      name: sectionName,
      catalogEntries: [],
    });

    return {
      name: sectionName,
      catalogEntries: [],
    };
  }

  export function createBattlePassStorefront(
    shop: Shop,
    sectionName: string,
  ): BattlePassStorefront {
    shop.storefronts.push({
      name: sectionName,
      catalogEntries: [],
    });

    return {
      name: sectionName,
      catalogEntries: [],
    };
  }
}
