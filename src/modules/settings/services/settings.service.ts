import {
  getSetting,
  saveSetting,
} from "../repositories/settings.repositories";

import {
  DEFAULT_HERO_TITLE,
  HERO_TITLE_KEY,
  HERO_TITLE_MAX_LENGTH,
  HERO_TITLE_MAX_LINES,
  splitHeroTitle,
} from "../heroTitle";

export async function getHeroTitle() {
  const stored = await getSetting(HERO_TITLE_KEY);

  return stored?.trim() ? stored : DEFAULT_HERO_TITLE;
}

export async function updateHeroTitle(title: string) {
  const lines = splitHeroTitle(title);

  if (lines.length === 0) {
    throw new Error("El título no puede estar vacío");
  }

  if (lines.length > HERO_TITLE_MAX_LINES) {
    throw new Error(`El título admite máximo ${HERO_TITLE_MAX_LINES} líneas`);
  }

  const normalized = lines.join("\n");

  if (normalized.length > HERO_TITLE_MAX_LENGTH) {
    throw new Error(
      `El título no puede superar ${HERO_TITLE_MAX_LENGTH} caracteres`,
    );
  }

  await saveSetting(HERO_TITLE_KEY, normalized);

  return normalized;
}
