import { accountService, logger } from "..";

export type ProfileId = "athena" | "common_core" | "creative" | "common_public";

export default class MCPResponses {
  static generate(profile: any, changes: object[], profileId: ProfileId) {
    return {
      profileRevision: parseInt(profile.rvn),
      profileId: profileId,
      profileChangesBaseRevision: parseInt(profile.rvn) - 1,
      profileChanges: changes,
      profileCommandRevision: parseInt(profile.rvn),
      serverTime: new Date().toISOString(),
      responseVersion: 1,
    };
  }
}
