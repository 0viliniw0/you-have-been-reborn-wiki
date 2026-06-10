import { z } from 'zod';

export const LocalizedStringSchema = z.object({
  ru: z.string(),
  en: z.string(),
});

export const EntityCategory = z.enum([
  'items',
  'mobs',
  'skills',
  'npcs',
  'locations',
  'quests',
  'recipes',
  'achievements',
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

export const ItemSchema = BaseEntitySchema.extend({
  category: z.literal('items'),
  type: z.enum(['weapon', 'armor', 'consumable', 'material']).optional(),
  rarity: z.enum(['common', 'uncommon', 'rare', 'epic', 'legendary']).optional(),
  stats: z.record(z.string(), z.number()).optional(),
  recipeId: z.string().optional(),
});

export const MobSchema = BaseEntitySchema.extend({
  category: z.literal('mobs'),
  locationId: z.string().optional(),
  drops: z.array(z.string()).optional(),
  stats: z.record(z.string(), z.number()).optional(),
});

export const NpcSchema = BaseEntitySchema.extend({
  category: z.literal('npcs'),
  locationId: z.string().optional(),
});

export const QuestSchema = BaseEntitySchema.extend({
  category: z.literal('quests'),
  giverNpcId: z.string().optional(),
  rewards: z.array(z.string()).optional(),
});

export const RecipeSchema = BaseEntitySchema.extend({
  category: z.literal('recipes'),
  ingredients: z.array(z.object({
    itemId: z.string(),
    amount: z.number(),
  })).optional(),
  resultItemId: z.string().optional(),
  craftedByNpcId: z.string().optional(),
});

// For entities that don't have special fields yet
export const GenericEntitySchema = BaseEntitySchema;

export type BaseEntity = z.infer<typeof BaseEntitySchema>;
export type Item = z.infer<typeof ItemSchema>;
export type Mob = z.infer<typeof MobSchema>;
export type Npc = z.infer<typeof NpcSchema>;
export type Quest = z.infer<typeof QuestSchema>;
export type Recipe = z.infer<typeof RecipeSchema>;

export type Entity = Item | Mob | Npc | Quest | Recipe | BaseEntity;
