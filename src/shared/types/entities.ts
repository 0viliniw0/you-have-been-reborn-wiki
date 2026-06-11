import { z } from 'zod';

export const LocalizedStringSchema = z.object({
  ru: z.string(),
  en: z.string(),
});

export const EntityCategory = z.enum([
  'skills',
  'equipment',
  'consumables',
  'materials',
  'bestiary',
  'locations',
  'npcs',
  'recipes',
]);

export type EntityCategory = z.infer<typeof EntityCategory>;

export const BaseEntitySchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: LocalizedStringSchema,
  description: LocalizedStringSchema,
  image: z.string().optional(),
  tags: z.array(z.string()).default([]),
  category: EntityCategory,
  updatedAt: z.string(),
});

export const SkillSchema = BaseEntitySchema.extend({
  category: z.literal('skills'),
  manaCost: z.number().optional(),
  cooldown: z.number().optional(),
  requirements: z.object({
    level: z.number().optional(),
  }).optional(),
});

export const EquipmentSchema = BaseEntitySchema.extend({
  category: z.literal('equipment'),
  type: z.enum(['weapon', 'armor', 'accessory']),
  slot: z.string().optional(),
  stats: z.record(z.string(), z.number()).optional(),
  requirements: z.object({
    level: z.number().optional(),
  }).optional(),
});

export const ConsumableSchema = BaseEntitySchema.extend({
  category: z.literal('consumables'),
  duration: z.number().optional(), // in seconds
});

export const MaterialSchema = BaseEntitySchema.extend({
  category: z.literal('materials'),
  source: LocalizedStringSchema.optional(),
});

export const EntityBehavior = z.enum([
  'boss',
  'aggressive',
  'passive',
  'peaceful',
]);

export type EntityBehavior = z.infer<typeof EntityBehavior>;

export const BestiarySchema = BaseEntitySchema.extend({
  category: z.literal('bestiary'),
  behavior: EntityBehavior.default('aggressive'),
  level: z.number().optional(),
  locationId: z.string().optional(),
  stats: z.record(z.string(), z.number()).optional(),
  drops: z.array(z.object({
    id: z.string(), // ID of equipment, consumable or material
    chance: z.number(), // 0-100
  })).optional(),
});

export const LocationSchema = BaseEntitySchema.extend({
  category: z.literal('locations'),
  type: z.enum(['city', 'zone', 'dungeon', 'raid']),
  parentLocationId: z.string().optional(), // For sub-zones
});

export const NpcSchema = BaseEntitySchema.extend({
  category: z.literal('npcs'),
  role: LocalizedStringSchema.optional(),
  locationId: z.string().optional(),
});

export const RecipeSchema = BaseEntitySchema.extend({
  category: z.literal('recipes'),
  resultId: z.string(),
  resultQuantity: z.number().default(1),
  ingredients: z.array(z.object({
    id: z.string(),
    quantity: z.number(),
  })),
  stationId: z.string().optional(), // Can be a location or NPC
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
