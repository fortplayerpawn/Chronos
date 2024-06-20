import fetch from "node-fetch";
import type { JSONResponse, CosmeticSet } from "./interfaces/FortniteAPI";
import { config, logger } from "..";
import { CosmeticTypes } from "./enums/CosmeticTypes";
import type { BattlePassEntry, ItemGrants, Set } from "./interfaces/Declarations";
import { ShopHelper } from "./helpers/shophelper";
import path from "node:path";
import { createBattlePassEntryTemplate, createItemEntryTemplate } from "./helpers/template";
import { v4 as uuid } from "uuid";
import getRandomWeightedIndex from "./functions/getRandomWeightedIndex";
import { itemTypeProbabilities, rarityProbabilities } from "../constants/probabilities";
import { setDisplayAsset, setNewDisplayAssetPath } from "./helpers/displayAssets";
import { getPrice } from "./helpers/itemprices";

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
    json.set === null ||
    !json.shopHistory
  )
    return;

  if (json.shopHistory === null || json.shopHistory.length === 0) return;

  const itemType = json.type && typeof json.type === "object" ? json.type.backendValue : null;

  if (itemType && cosmeticTypes[itemType] !== undefined) {
    json.type.backendValue = cosmeticTypes[itemType];
  }

  if (!itemType) return;

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

ShopHelper.createStorefront(shop, "BRDailyStorefront");
ShopHelper.createStorefront(shop, "BRWeeklyStorefront");
ShopHelper.createBattlePassStorefront(shop, `BRSeason${config.currentSeason}`);

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
    }
  });
} catch (error) {
  void logger.error(`Failed to push battlepass data: ${error}`);
  throw error;
}

while (Object.keys(DailySectionOffers).length < 6) {
  let randomIndex: number = getRandomWeightedIndex(itemTypeProbabilities);
  const cosmeticType = cosmeticTypes[randomIndex];

  randomIndex = getRandomWeightedIndex(rarityProbabilities);

  const keys = Object.keys(items);

  if (keys.length === 0) continue;

  let randomKey: string;
  let randomItem: any;

  do {
    randomKey = keys[Math.floor(Math.random() * keys.length)];
    randomItem = items[randomKey];
  } while ( // Blocked items from being generated.
    randomItem.type.backendValue === "AthenaBackpack" ||
    randomItem.type.backendValue === "AthenaSkyDiveContrail" ||
    randomItem.type.backendValue === "AthenaMusicPack" ||
    randomItem.type.backendValue === "AthenaToy"
  );

  const entry = createItemEntryTemplate();

  entry.offerId = uuid();
  entry.offerType = "StaticPrice";

  if (!randomItem.displayAssetPath)
    randomItem.displayAssetPath = setDisplayAsset(`DA_Daily_${randomItem.id}`);

  entry.displayAssetPath = randomItem.displayAssetPath.includes("DA_Daily")
    ? randomItem.displayAssetPath
    : setDisplayAsset(`DA_Daily_${randomItem.id}`);

  entry.metaInfo.push({ key: "DisplayAssetPath", value: entry.displayAssetPath });
  entry.metaInfo.push({
    key: "NewDisplayAssetPath",
    value: setNewDisplayAssetPath(`DAv2_${randomItem.id}`),
  });
  entry.metaInfo.push({ key: "TileSize", value: "Normal" });
  entry.metaInfo.push({ key: "SectionId", value: "Daily" });

  entry.meta.NewDisplayAssetPath = setNewDisplayAssetPath(`DAv2_${randomItem.id}`);
  entry.meta.displayAssetPath = entry.displayAssetPath;
  entry.meta.SectionId = "Daily";
  entry.meta.TileSize = "Normal";

  entry.requirements.push({
    requirementType: "DenyOnItemOwnership",
    requiredId: `${randomItem.type.backendValue}:${randomItem.id}`,
    minQuantity: 1,
  });

  entry.refundable = true;
  entry.giftInfo.bIsEnabled = true;
  entry.giftInfo.forcedGiftBoxTemplateId = "";
  entry.giftInfo.purchaseRequirements = entry.requirements;
  entry.giftInfo.giftRecordIds = [];

  const price = getPrice(randomItem);

  if (!price) continue;

  for (const prices of entry.prices) {
    prices.currencySubType = "Currency";
    prices.currencyType = "MtxCurrency";
    prices.dynamicRegularPrice = -1;
    prices.saleExpiration = "9999-12-31T23:59:59.999Z";
    prices.basePrice = price;
    prices.regularPrice = price;
    prices.finalPrice = price;
  }

  entry.devName = `[VIRTUAL] 1x ${randomItem.type.backendValue}:${randomItem.id} for ${price} MtxCurrency`;

  entry.itemGrants.push({
    templateId: `${randomItem.type.backendValue}:${randomItem.id}`,
    quantity: 1,
  });

  const dailyStorefront = shop.storefronts.find(
    (storefront) => storefront.name === "BRDailyStorefront",
  );
  if (dailyStorefront) {
    dailyStorefront.catalogEntries.push(entry);
  }

  DailySectionOffers[entry.offerId] = {
    templateId: `${randomItem.type.backendValue}:${randomItem.id}`,
    quantity: 1,
  };
}

await Bun.write(path.join(__dirname, "out.json"), JSON.stringify(shop, null, 2));
