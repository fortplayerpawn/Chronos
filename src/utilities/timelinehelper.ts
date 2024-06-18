import { logger } from "..";
import { Timeline, type Event } from "../tables/timeline";
import uaparser from "./uaparser";

export interface SeasonEvent {
  seasonNumber: number;
  events: Event[];
}

export default class TimelineHelper {
  private static readonly activeUntil = "9999-01-01T00:00:00.000Z";

  public static async createTimeline(userAgent: string | undefined) {
    const currentDate = new Date().toISOString();
    const uahelper = uaparser(userAgent);
    const eventType = `EventFlag.LobbySeason${uahelper?.season}`;

    let existingTimeline = await Timeline.findOne({ where: { eventName: eventType } });

    if (existingTimeline)
      return [
        {
          eventName: existingTimeline.eventName,
          activeUntil: existingTimeline.activeUntil,
          activeSince: existingTimeline.activeSince,
        },
      ];
    else {
      const newTimeline = new Timeline();

      newTimeline.eventName = eventType;
      newTimeline.activeUntil = this.activeUntil;
      newTimeline.activeSince = currentDate;

      await newTimeline.save();

      return [
        {
          eventName: newTimeline.eventName,
          activeUntil: newTimeline.activeUntil,
          activeSince: newTimeline.activeSince,
        },
      ];
    }
  }

  public static async addNewEvent(eventType: string, activeSince: string, activeUntil: string) {
    try {
      const existingTimeline = await Timeline.findOne({ where: { eventName: eventType } });

      if (existingTimeline) return { success: false, message: "This event already exists." };

      const newTimeline = new Timeline();

      newTimeline.eventName = eventType;
      newTimeline.activeUntil = activeUntil;
      newTimeline.activeSince = activeSince;

      await newTimeline.save();

      return { success: true, event: newTimeline };
    } catch (error) {
      logger.error(`Error adding new event: ${error}`);

      return { success: false, message: "Failed to add new event." };
    }
  }
}
