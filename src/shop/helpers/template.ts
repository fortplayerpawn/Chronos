import type { BattlePassEntry, Entries, GiftInfo, Meta } from "../interfaces/Declarations";

export function createBattlePassEntryTemplate(): BattlePassEntry {
  return {
    offerId: "",
    devName: "",
    offerType: "",
    prices: [],
    categories: [],
    dailyLimit: -1,
    weeklyLimit: -1,
    monthlyLimit: -1,
    appStoreId: [],
    requirements: [],
    metaInfo: [],
    displayAssetPath: "",
    itemGrants: [],
    sortPriority: 1,
    catalogGroupPriority: 1,
    title: {},
    description: {},
    catalogGroup: "",
    shortDescription: "",
  };
}

export function createItemEntryTemplate(): Entries {
  return {
    offerId: "",
    devName: "",
    offerType: "",
    prices: [],
    categories: [],
    dailyLimit: 0,
    weeklyLimit: 0,
    monthlyLimit: 0,
    refundable: false,
    appStoreId: [],
    requirements: [],
    giftInfo: {} as GiftInfo,
    matchFilter: "",
    filterWeight: 0,
    metaInfo: [],
    displayAssetPath: "",
    itemGrants: [],
    additionalGrants: [],
    sortPriority: 0,
    catalogGroupPriority: 0,
    meta: {} as Meta,
  };
}
