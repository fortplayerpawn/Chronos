import type { Shop, StorefrontNames } from "../interfaces/Declarations";

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

  export function createStorefront(shop: Shop, sectionName: StorefrontNames) {
    shop.storefronts.push({
      name: sectionName,
      catalogEntries: [],
    });
  }
}
