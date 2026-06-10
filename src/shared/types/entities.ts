import { z } from 'zod';

export const LocalizedStringSchema = z.object({
  ru: z.string(),
  en: z.string(),
});

export const BaseEntitySchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: LocalizedStringSchema,
  description: LocalizedStringSchema,
  image: z.string().optional(),
  tags: z.array(z.string()).default([]),
  category: z.string(),
  updatedAt: z.string(),
});

export type BaseEntity = z.infer<typeof BaseEntitySchema>;

export const ItemSchema = BaseEntitySchema.extend({
  type: z.enum(['weapon', 'armor', 'consumable', 'material']).optional(),
  rarity: z.enum(['common', 'uncommon', 'rare', 'epic', 'legendary']).optional(),
  stats: z.record(z.number()).optional(),
  recipeId: z.string().optional(),
});

export const MobSchema = BaseEntitySchema.extend({
  locationId: z.string().optional(),
  drops: z.array(z.string()).optional(),
  stats: z.record(z.number()).optional(),
});

export const NpcSchema = BaseEntitySchema.extend({
  locationId: z.string().optional(),
});

export const QuestSchema = BaseEntitySchema.extend({
  giverNpcId: z.string().optional(),
  rewards: z.array(z.string()).optional(),
});

export const RecipeSchema = BaseEntitySchema.extend({
  ingredients: z.array(z.object({
    itemId: z.string(),
    amount: z.number(),
  })).optional(),
  resultItemId: z.string().optional(),
  craftedByNpcId: z.string().optional(),
});

export const EntityType = z.enum([
  'items',
  'mobs',
  'skills',
  'npcs',
  'locations',
  'quests',
  'recipes',
  'achievements',
]);

export type EntityType = z.infer<typeof EntityType>;
