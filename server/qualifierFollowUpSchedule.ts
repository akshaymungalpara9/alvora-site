import type { Express, Request, Response } from "express";
import { getQualifierFollowUpScheduleByTaskUid, recordQualifierFollowUpRun } from "./db";
import { runDueQualifierFollowUps } from "./qualifierFollowUps";
import { sdk } from "./_core/sdk";

export function registerQualifierFollowUpSchedule(app: Express) {
  app.post("/api/scheduled/qualifier-follow-ups", async (req: Request, res: Response) => {
    let taskUid: string | undefined;
    try {
      const user = await sdk.authenticateRequest(req);
      if (!user.isCron || !user.taskUid) return res.status(403).json({ error: "cron-only" });
      taskUid = user.taskUid;
      const schedule = await getQualifierFollowUpScheduleByTaskUid(taskUid);
      if (!schedule || !schedule.isEnabled) return res.json({ ok: true, skipped: "disabled-or-orphan" });

      const result = await runDueQualifierFollowUps();
      await recordQualifierFollowUpRun(schedule.id, {});
      return res.json({ ok: true, ...result });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown qualifier follow-up failure";
      if (taskUid) {
        const schedule = await getQualifierFollowUpScheduleByTaskUid(taskUid).catch(() => undefined);
        if (schedule) await recordQualifierFollowUpRun(schedule.id, { error: message }).catch(() => undefined);
      }
      return res.status(500).json({ error: message, context: { path: req.path, taskUid }, timestamp: new Date().toISOString() });
    }
  });
}
