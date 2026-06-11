import { Entity, EntityCategory } from "../../../shared/types/entities";

export const STORAGE_KEY = "wiki_editor_state";

export const ENTITY_DEFAULTS: Record<EntityCategory, Partial<Entity>> = {
  skills: {},
  equipment: { type: "weapon" },
  consumables: {},
  materials: {},
  bestiary: { behavior: "aggressive", drops: [] },
  locations: {},
  npcs: { locationIds: [] },
  recipes: { resultId: "", resultQuantity: 1, ingredients: [] },
};
