import type { CookieOptionsWithName } from "@supabase/ssr";

/**
 * Session cookies for My TAB and TAB Practice (SEC-020). Only the server reads them (there is no browser Supabase
 * client), so they are httpOnly; secure outside local development; and time-boxed to seven days instead of
 * @supabase/ssr's default of 400, after which the person signs in again with a fresh emailed link.
 */
export const SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;
export const sessionCookieOptions: CookieOptionsWithName = {
  path: "/",
  sameSite: "lax",
  httpOnly: true,
  secure: process.env.NODE_ENV !== "development",
  maxAge: SESSION_MAX_AGE_SECONDS,
};
