export const ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
  resendApiKey: process.env.RESEND_API_KEY ?? "",
  leadAlertTo: process.env.LEAD_ALERT_TO ?? "",
  alvoraEmailFrom: process.env.ALVORA_EMAIL_FROM ?? "Alvora Diamonds <onboarding@resend.dev>",
  alvoraEarlyAccessEnabled: process.env.ALVORA_EARLY_ACCESS_ENABLED === "true",
};

/**
 * Whether /stone/:report pages should carry indexable robots meta.
 * Ships false in this commit; flipped in a later Phase 5 prompt via env or by
 * flipping the default here. seoInjection reads the current process.env each
 * call so tests can override without a module reset.
 */
export function isStonePassportIndexable(): boolean {
  return process.env.STONE_PASSPORT_INDEXABLE === "true";
}

/** Static default surface, read once at import. Present for downstream code that wants a compile-time constant. */
export const STONE_PASSPORT_INDEXABLE: boolean = isStonePassportIndexable();
