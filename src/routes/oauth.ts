import { app, config, logger, tokensService, userService } from "..";
import type { User } from "../tables/user";
import errors from "../utilities/errors";
import TokenUtilities from "../utilities/tokens";
import { v4 as uuid } from "uuid";
import jwt from "jsonwebtoken";
import crypto from "node:crypto";

export function validateBase64(input: string) {
  return /^[A-Za-z0-9+/]*={0,2}$/.test(input);
}

export default function () {
  app.post("/account/api/oauth/token", async (c) => {
    const tokenHeader = c.req.header("Authorization");
    const timestamp = new Date().toISOString();

    if (!tokenHeader)
      return c.json(
        errors.createError(400, c.req.url, "Invalid Headers.", timestamp),
        400
      );

    const token = tokenHeader.split(" ");

    if (token.length !== 2 || !validateBase64(token[1]))
      return c.json(
        errors.createError(400, c.req.url, "Invalid base64", timestamp)
      );

    let body;

    try {
      body = await c.req.parseBody();
    } catch (error) {
      return c.json(
        errors.createError(400, c.req.url, "Invalid body.", timestamp),
        400
      );
    }

    let { grant_type } = body;

    const clientId: string = Buffer.from(token[1], "base64")
      .toString()
      .split(":")[0];

    if (!clientId)
      return c.json(
        errors.createError(400, c.req.url, "Invalid client.", timestamp),
        400
      );
    let user: User | null;

    switch (grant_type) {
      case "password":
        const { username, password } = body;

        if (!password || !username)
          return c.json(
            errors.createError(
              400,
              c.req.url,
              "username or password is missing.",
              timestamp
            ),
            400
          );

        user = await userService.findUserByEmail(username as string);

        if (!user)
          return c.json(
            errors.createError(
              404,
              c.req.url,
              "Failed to find user.",
              timestamp
            ),
            404
          );

        if (user.banned)
          return c.json(
            errors.createError(
              403,
              c.req.url,
              "This user is banned.",
              timestamp
            ),
            403
          );

        if (!(await Bun.password.verify(password as string, user.password)))
          return c.json(
            errors.createError(
              400,
              c.req.url,
              "Invalid account credentials.",
              timestamp
            ),
            400
          );
        break;

      case "client_credentials":
        const token = jwt.sign(
          {
            p: crypto.randomBytes(128).toString("base64"),
            clsvc: "fortnite",
            t: "s",
            mver: false,
            clid: clientId,
            ic: true,
            exp: Math.floor(Date.now() / 1000) + 240 * 240,
            am: "client_credentials",
            iat: Math.floor(Date.now() / 1000),
            jti: crypto.randomBytes(32).toString("hex"),
            token_creation_time: new Date().toISOString(),
            expires_in: 1,
          },
          config.client_secret
        );

        return c.json({
          access_token: `eg1~${token}`,
          expires_in: 3600,
          expires_at: new Date(Date.now() + 3600 * 1000).toISOString(),
          token_type: "bearer",
          client_id: clientId,
          internal_client: true,
          client_service: "fortnite",
        });

      default:
        return c.json({ error: "Invalid grant" }, 400);
    }

    if (!user) return c.json({ error: "Invalid account credentials" }, 400);

    await tokensService.deleteAll();

    const accessToken = await TokenUtilities.createAccessToken(
      clientId,
      grant_type as string,
      user
    );
    const refreshToken = await TokenUtilities.createRefreshToken(
      clientId,
      user
    );

    return c.json({
      access_token: `eg1~${accessToken}`,
      expires_in: 3600,
      expires_at: new Date(Date.now() + 3600 * 1000).toISOString(),
      token_type: "bearer",
      account_id: user.accountId,
      client_id: clientId,
      internal_client: true,
      client_service: "fortnite",
      refresh_token: `eg1~${refreshToken}`,
      refresh_expires: 86400,
      refresh_expires_at: new Date(Date.now() + 86400 * 1000).toISOString(),
      displayName: user.username,
      app: "fortnite",
      in_app_id: user.accountId,
      device_id: uuid().replace(/-/gi, ""),
    });
  });
}
