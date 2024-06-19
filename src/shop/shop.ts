import fetch from "node-fetch";
import type { JSONResponse, CosmeticSet } from "./interfaces/FortniteAPI";
import { config, logger } from "..";
import { CosmeticTypes } from "./enums/CosmeticTypes";
import type { BattlePassEntry, ItemGrants, Set } from "./interfaces/Declarations";
import { ShopHelper } from "./helpers/shophelper";
import path from "node:path";
import { createBattlePassEntryTemplate, createItemEntryTemplate } from "./helpers/template";
import { v4 as uuid } from "uuid";

const request = await fetch("https://fortnite-api.com/v2/cosmetics/br").then(
  async (res) => (await res.json()) as any,
);

const cosmeticTypes: Record<string, CosmeticTypes> = {};

export const items: Record<string, JSONResponse> = {};
export const sets: Record<string, Set> = {};
export const shop = ShopHelper.createShop();

export const DailySectionOffers: Record<string, ItemGrants> = {};
export const WeeklySectionOffers: Record<string, ItemGrants> = {};

const response = request.data as JSONResponse[];
response.map(async (json) => {
  if (
    !json.introduction ||
    json.introduction.backendValue > config.currentSeason ||
    json.introduction.backendValue === 0 ||
    json.set === null
  )
    return;

  if (json.shopHistory === null || json.shopHistory.length === 0) return;

  const itemType = json.type && typeof json.type === "object" ? json.type.backendValue : null;

  if (itemType !== null) json.type.backendValue = cosmeticTypes[itemType];

  if (!sets[json.set.backendValue]) {
    sets[json.set.backendValue] = {
      value: json.set.value,
      text: json.set.text,
      definition: [],
    };
  }

  sets[json.set.backendValue].definition.push(json);
  items[json.id] = json;
});

const dailySection = ShopHelper.createStorefront(shop, "BRDailyStorefront");
const weeklySection = ShopHelper.createStorefront(shop, "BRWeeklyStorefront");
const battlePass = ShopHelper.createBattlePassStorefront(shop, `BRSeason${config.currentSeason}`);

try {
  const BRSeasonJSON = await Bun.file(
    path.join(__dirname, "..", "memory", "storefront", `BRSeason${config.currentSeason}.json`),
  ).json();

  BRSeasonJSON.catalogEntries.forEach((entryData: BattlePassEntry) => {
    let battlepassOffer: any = createBattlePassEntryTemplate();

    // battlepassOffer.offerId = entryData.offerId;
    // battlepassOffer.devName = entryData.devName;
    // battlepassOffer.offerType = entryData.offerType;
    // battlepassOffer.prices = prices;
    // battlepassOffer.appStoreId = entryData.appStoreId;
    // battlepassOffer.description = entryData.description;
    // battlepassOffer.displayAssetPath = entryData.displayAssetPath;
    // battlepassOffer.title = entryData.title;
    battlepassOffer = entryData;

    const seasonStorefront = shop.storefronts.find(
      (storefront) => storefront.name === `BRSeason${config.currentSeason}`,
    );
    if (seasonStorefront) {
      seasonStorefront.catalogEntries.push(battlepassOffer);
      battlePass.catalogEntries.push(battlepassOffer);
    }
  });
} catch (error) {
  void logger.error(`Failed to push battlepass data: ${error}`);
  throw error;
}

while (Object.keys(DailySectionOffers).length < 6) {
  const offer = createItemEntryTemplate();

  offer.offerId = uuid().replace(/-/gi, "");
  offer.refundable = true;
  offer.giftInfo.bIsEnabled = true;
}
