import { Entity, EntityCategory } from "../../../shared/types/entities";

export const STORAGE_KEY = "wiki_editor_state";

export const ENTITY_DEFAULTS: Record<EntityCategory, Partial<Entity>> = {
  skills: { manaCost: 0, cooldown: 0, requirements: { level: 1 } },
  equipment: { type: "weapon", stats: {}, requirements: { level: 1 } },
  consumables: {},
  materials: {},
  bestiary: { behavior: "aggressive", level: 1, stats: {}, drops: [] },
  locations: { type: "zone" },
  npcs: { role: { ru: "", en: "" } },
  recipes: { resultId: "", resultQuantity: 1, ingredients: [] },
};
