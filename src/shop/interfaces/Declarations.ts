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
  name: string;
  catalogEntries: Entries[];
}

export interface BattlePassStorefront {
  name: string;
  catalogEntries: BattlePassEntry[];
}

export interface Entries {
  offerId: string;
  devName: string;
  offerType: string;
  prices: Prices[];
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

export interface BattlePassEntry {
  offerId: string;
  devName: string;
  offerType: string;
  prices: {
    currencyType: string;
    currencySubType: string;
    regularPrice: number;
    finalPrice: number;
    saleType: string;
    saleExpiration: string;
    basePrice: number;
  }[];
  categories: string[];
  dailyLimit: number;
  weeklyLimit: number;
  monthlyLimit: number;
  appStoreId: string[];
  requirements: {
    requirementType: string;
    requiredId: string;
    minQuantity: number;
  }[];
  metaInfo: MetaInfo[];
  catalogGroup: string;
  catalogGroupPriority: number;
  sortPriority: number;
  title: {
    [key: string]: string;
  };
  shortDescription: string;
  description: {
    [key: string]: string;
  };
  displayAssetPath: string;
  itemGrants: ItemGrants[];
}

export interface Meta {
  NewDisplayAssetPath: string;
  LayoutId: string;
  TileSize: string;
  AnalyticOfferGroupId: string;
  SectionId: string;
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
  purchaseRequirements: Requirements[];
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
