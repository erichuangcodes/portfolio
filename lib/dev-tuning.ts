/** Dev-only Leva tuning panels. Statically replaced at build time, so the
 *  panels and Leva itself tree-shake out of production. */
export const DEV_TUNING = process.env.NODE_ENV === "development";
