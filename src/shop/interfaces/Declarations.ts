import type { GuildDefaultMessageNotifications } from "discord.js";
import type { JSONResponse } from "./FortniteAPI";

export type StorefrontNames = "BRWeeklyStorefront" | "BRDailyStorefront";
type CurrencyType = "RealMoney" | "MtxCurrency";

export interface Set {
  value: string;
  text: string;
  definition: JSONResponse[];
}

export interface Shop {
  expiration: string;
  refreshIntervalHrs: number;
  dailyPurchaseHrs: number;
  storefronts: Storefronts[];
}

export interface Storefronts {
  name: StorefrontNames;
  catalogEntries: Entries[];
}

export interface Entries {
  offerId: string;
  devName: string;
  offerType: string;
  prices: Prices;
  categories: string[];
  dailyLimit: number;
  weeklyLimit: number;
  monthlyLimit: number;
  refundable: boolean;
  appStoreId: string[];
  requirements: Requirements[];
  giftInfo: GiftInfo;
  matchFilter: string;
  filterWeight: number;
  metaInfo: MetaInfo[];
  displayAssetPath: string;
  itemGrants: ItemGrants[];
  additionalGrants: ItemGrants[]; // idk
  sortPriority: number;
  catalogGroupPriority: number;
  meta: Meta;
}

export interface Meta {
  NewDisplayAssetPath: string;
  LayoutId: string;
  TileSize: string;
  AnalyticOfferGroupId: string;
  templateId: string;
  inDate: string;
  outDate: string;
  displayAssetPath: string;
}

export interface ItemGrants {
  templateId: string;
  quantity: number;
}

export interface MetaInfo {
  key: string;
  value: string;
}

export interface GiftInfo {
  bIsEnabled: boolean;
  forcedGiftBoxTemplateId: string;
  purchaseRequirements: Requirements;
  giftRecordIds: string[];
}

export interface Requirements {
  requirementType: string;
  requiredId: string;
  minQuantity: number;
}

export interface Prices {
  currencyType: CurrencyType;
  currencySubType: string;
  regularPrice: number;
  dynamicRegularPrice: number;
  finalPrice: number;
  saleExpiration: string;
  basePrice: number;
}
