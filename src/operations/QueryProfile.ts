import type { Context } from "hono";
import { userService, accountService, logger } from "..";
import errors from "../utilities/errors";
import type { ProfileId } from "../utilities/responses";
import Profiles from "../utilities/profiles";
import MCPResponses from "../utilities/responses";

export default async function (c: Context) {
  const accountId = c.req.param("accountId");
  const rvn = c.req.query("rvn");
  const profileId = c.req.query("profileId") as ProfileId;

  const timestamp = new Date().toISOString();

  if (!accountId || !rvn || !profileId) {
    return c.json(
      errors.createError(
        400,
        c.req.url,
        "Missing query parameters.",
        timestamp
      ),
      400
    );
  }

  try {
    const [user, account] = await Promise.all([
      userService.findUserByAccountId(accountId),
      accountService.findUserByAccountId(accountId),
    ]);

    if (!user || !account) {
      return c.json(
        errors.createError(
          404,
          c.req.url,
          "Failed to find user or account.",
          timestamp
        ),
        404
      );
    }

    // await accountService.incrementRevision(accountId, profileId); ewwwwww
    const profile = await Profiles.getProfile(accountId, profileId);

    if (!profile) return c.json(MCPResponses.generate({rvn}, [], profileId));

    const applyProfileChanges = [
      {
        changeType: "fullProfileUpdate",
        profile,
      },
    ];

    return c.json(
      MCPResponses.generate(profile, applyProfileChanges, profileId)
    );
  } catch (error) {
    void logger.error(`Error in QueryProfile: ${error}`);
    return c.json(
      errors.createError(500, c.req.url, "Internal server error.", timestamp),
      500
    );
  }
}