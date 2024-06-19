import fetch from "node-fetch";
import type { JSONResponse, CosmeticSet } from "./interfaces/FortniteAPI";
import { config } from "..";
import { CosmeticTypes } from "./enums/CosmeticTypes";
import type { Set } from "./interfaces/Declarations";
import { ShopHelper } from "./helpers/shophelper";

const request = await fetch("https://fortnite-api.com/v2/cosmetics/br").then(
  async (res) => (await res.json()) as any,
);

const cosmeticTypes: Record<string, CosmeticTypes> = {};

export const items: Record<string, JSONResponse> = {};
export const sets: Record<string, Set> = {};
export const shop = ShopHelper.createShop();

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

ShopHelper.createStorefront(shop, "BRDailyStorefront");
ShopHelper.createStorefront(shop, "BRWeeklyStorefront");
