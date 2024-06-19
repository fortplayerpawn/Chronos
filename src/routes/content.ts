import axios from "axios";
import { app, contentpagesService, logger } from "..";
import { Contentpages } from "../tables/contentpages";
import errors from "../utilities/errors";
import uaparser from "../utilities/uaparser";
import { v4 as uuid } from "uuid";
import fetch from "node-fetch";

interface Background {
  stage: string;
  _type: string;
  key: string;
}

export default function () {
  app.get("/content/api/pages/fortnite-game", async (c) => {
    const useragent = c.req.header("User-Agent");
    const timestamp = new Date().toISOString();

    if (!useragent)
      return c.json(
        errors.createError(400, c.req.url, "header 'User-Agent' is missing.", timestamp),
        400,
      );

    const uahelper = uaparser(useragent);

    if (!uahelper)
      return c.json(
        errors.createError(400, c.req.url, "Failed to parse User-Agent.", timestamp),
        400,
      );

    let existingBg = await contentpagesService.findMany(`season${uahelper.season}`, [
      "lobby",
      "vault",
    ]);

    const backgrounds: Background[] = [];

    let existingBackground = existingBg!.find((bg) => bg.stage === `season${uahelper.season}`);

    if (!existingBackground) {
      let newBackground = new Contentpages();
      newBackground.stage = `season${uahelper.season}`;
      newBackground.key = "lobby";
      await newBackground.save();
      logger.debug(`Created background: ${newBackground.stage} - ${newBackground.key}`);

      backgrounds.push({
        stage: newBackground.stage,
        _type: "DynamicBackground",
        key: newBackground.key,
      });

      newBackground = new Contentpages();
      newBackground.stage = `season${uahelper.season}`;
      newBackground.key = "vault";
      await newBackground.save();
      logger.debug(`Created background: ${newBackground.stage} - ${newBackground.key}`);

      backgrounds.push({
        stage: newBackground.stage,
        _type: "DynamicBackground",
        key: newBackground.key,
      });
    }
    const existingBackgrounds = await contentpagesService.findAll();

    if (!existingBackgrounds)
      return c.json(
        errors.createError(400, c.req.url, "Failed to find backgrounds..", timestamp),
        400,
      );

    existingBackgrounds.forEach((existing) => {
      backgrounds.push({
        stage: existing.stage,
        _type: "DynamicBackground",
        key: existing.key,
      });
    });

    const request = await fetch(
      "https://fortnitecontent-website-prod07.ol.epicgames.com/content/api/pages/fortnite-game",
    ).then((res) => res.json() as any);

    /// TODO - VaultBackgrounds (ShopBackgrounds) & Emergencynotices & Battleroyalenews

    request.dynamicbackgrounds = {
      "jcr:isCheckedOut": true,
      backgrounds: {
        backgrounds,
        _type: "DynamicBackgroundList",
      },
      _title: "dynamicbackgrounds",
      _noIndex: false,
      "jcr:baseVersion": "a7ca237317f1e71f17852c-bccd-4be6-89a0-1bb52672a444",
      _activeDate: new Date(),
      lastModified: new Date(),
      _locale: "en-US",
    };
    request.subgameinfo.battleroyale = {};

    return c.json(request);
  });
}
