/**
 * Utilidades del título del encabezado sin acceso a base de datos: las usan
 * tanto el servidor como los componentes de cliente, que no pueden importar
 * el repositorio (arrastraría mysql2 al navegador).
 */

export const HERO_TITLE_KEY = "hero_title";

export const DEFAULT_HERO_TITLE = "Creamos.\nProducimos.\nEntregamos.";

export const HERO_TITLE_MAX_LINES = 4;

export const HERO_TITLE_MAX_LENGTH = 120;

/** El título se guarda con un salto de línea por renglón del encabezado. */
export function splitHeroTitle(title: string) {
  return title
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}
