import { db } from "../db/client";
import { analyticsEvents } from "../db/schema";

export const analyticsRepo = {
  /**
   * Logs telemetry data to track core product success metrics (KPIs)
   */
  async log(userId: string, eventType: string, eventData?: Record<string, unknown>) {
    const [newEvent] = await db
      .insert(analyticsEvents)
      .values({
        userId,
        eventType,
        eventData: eventData ?? {},
      })
      .returning();

    return newEvent;
  },
};