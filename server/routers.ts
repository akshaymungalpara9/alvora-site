import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { adminBuyerRouter, buyerPortalRouter } from "./routers/buyers";
import { adminProductionBriefRouter, publicProductionBriefRouter } from "./routers/briefs";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => ({ user: opts.ctx.user ?? null })),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  admin: adminBuyerRouter,
  adminBriefs: adminProductionBriefRouter,
  buyer: buyerPortalRouter,
  productionBrief: publicProductionBriefRouter,
});

export type AppRouter = typeof appRouter;
