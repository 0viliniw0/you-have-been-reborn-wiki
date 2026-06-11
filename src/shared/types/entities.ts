import { z } from "zod";

export const LocalizedStringSchema = z.object({
  ru: z.string(),
  en: z.string(),
});

export const EntityCategory = z.enum([
  "skills",
  "equipment",
  "consumables",
  "materials",
  "bestiary",
  "locations",
  "npcs",
  "recipes",
]);

export type EntityCategory = z.infer<typeof EntityCategory>;

export const BaseEntitySchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: LocalizedStringSchema,
  description: LocalizedStringSchema,
  image: z.string().optional(),
  tags: z.array(z.string()).default([]),
  relatedIds: z.array(z.string()).default([]),
  category: EntityCategory,
  updatedAt: z.string(),
});

export const SkillSchema = BaseEntitySchema.extend({
  category: z.literal("skills"),
});

export const EquipmentType = z.enum(["weapon", "armor", "accessory"]);
export type EquipmentType = z.infer<typeof EquipmentType>;

export const EquipmentSchema = BaseEntitySchema.extend({
  category: z.literal("equipment"),
  type: EquipmentType.default("weapon"),
  skillIds: z.array(z.string()).default([]),
});

export const ConsumableSchema = BaseEntitySchema.extend({
  category: z.literal("consumables"),
});

export const MaterialSchema = BaseEntitySchema.extend({
  category: z.literal("materials"),
});

export const EntityBehavior = z.enum([
  "boss",
  "aggressive",
  "passive",
  "peaceful",
]);
export type EntityBehavior = z.infer<typeof EntityBehavior>;

export const BestiarySchema = BaseEntitySchema.extend({
  category: z.literal("bestiary"),
  behavior: EntityBehavior.default("aggressive"),
  locationIds: z.array(z.string()).default([]),
  drops: z
    .array(
      z.object({
        id: z.string(),
        chance: z.number(),
      }),
    )
    .optional(),
});

export const LocationSchema = BaseEntitySchema.extend({
  category: z.literal("locations"),
});

export const NpcSchema = BaseEntitySchema.extend({
  category: z.literal("npcs"),
  locationIds: z.array(z.string()).default([]),
});

export const RecipeSchema = BaseEntitySchema.extend({
  category: z.literal("recipes"),
  resultId: z.string(),
  resultQuantity: z.number().default(1),
  ingredients: z.array(
    z.object({
      id: z.string(),
      quantity: z.number(),
    }),
  ),
});

export type BaseEntity = z.infer<typeof BaseEntitySchema>;
export type Skill = z.infer<typeof SkillSchema>;
export type Equipment = z.infer<typeof EquipmentSchema>;
export type Consumable = z.infer<typeof ConsumableSchema>;
export type Material = z.infer<typeof MaterialSchema>;
export type Bestiary = z.infer<typeof BestiarySchema>;
export type Location = z.infer<typeof LocationSchema>;
export type Npc = z.infer<typeof NpcSchema>;
export type Recipe = z.infer<typeof RecipeSchema>;

export type Entity =
  | Skill
  | Equipment
  | Consumable
  | Material
  | Bestiary
  | Location
  | Npc
  | Recipe;
