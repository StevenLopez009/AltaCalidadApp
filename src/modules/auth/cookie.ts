export const ADMIN_TOKEN_COOKIE = "admin_token";

/**
 * Un cookie marcado como Secure es descartado por el navegador cuando el sitio
 * se sirve por HTTP: el login respondería success pero la sesión no quedaría.
 * El despliegue actual corre sobre HTTP en una IP pelada, así que se permite
 * desactivarlo con COOKIE_SECURE=false. Sin esa variable el comportamiento
 * seguro se mantiene: Secure en producción.
 */
export const useSecureCookie =
  process.env.COOKIE_SECURE !== "false" &&
  process.env.NODE_ENV === "production";
