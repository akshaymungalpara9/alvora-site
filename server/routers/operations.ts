import { getOperationsOverview } from "../db";
import { adminProcedure, router } from "../_core/trpc";

export const adminOperationsRouter = router({
  overview: adminProcedure.query(() => getOperationsOverview()),
});
