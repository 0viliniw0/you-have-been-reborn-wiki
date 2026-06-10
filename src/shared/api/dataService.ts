import { 
  BaseEntity, 
  EntityCategory as EntityType, 
  NpcSchema, 
  QuestSchema, 
  BaseEntitySchema,
  SkillSchema,
  BestiarySchema,
  ConsumableSchema,
  EquipmentSchema,
  LocationSchema,
  MaterialSchema
} from "../types/entities";
import { z } from 'zod';

const SchemaMap: Record<string, z.ZodSchema> = {
  skills: SkillSchema,
  bestiary: BestiarySchema,
  consumables: ConsumableSchema,
  equipment: EquipmentSchema,
  locations: LocationSchema,
  materials: MaterialSchema,
  npcs: NpcSchema,
  quests: QuestSchema,
};

// Metadata file that tracks all data files for automatic discovery
export type DataRegistry = string[];

export const fetchRegistry = async (): Promise<DataRegistry> => {
  const response = await fetch("./data/registry.json");
  if (!response.ok) throw new Error("Failed to load registry");
  return response.json();
};

export const fetchEntitiesBatch = async (
  categoryOrFileName: string,
): Promise<BaseEntity[]> => {
  const fileName = categoryOrFileName.endsWith(".json") 
    ? categoryOrFileName 
    : `${categoryOrFileName}.json`;
    
  const response = await fetch(`./data/${fileName}`);
  if (!response.ok) throw new Error(`Failed to load ${fileName}`);
  const data = await response.json();

  // Extract category from filename (e.g., "items.json" -> "items")
  const type = fileName.replace(".json", "") as EntityType;
  const schema = SchemaMap[type] || BaseEntitySchema;
  const result = z.array(schema).safeParse(data);

  if (!result.success) {
    console.error(`Validation error in ${fileName}:`, result.error);
    return data as BaseEntity[]; 
  }

  return result.data as BaseEntity[];
};

export const loadAllEntities = async (): Promise<BaseEntity[]> => {
  const registry = await fetchRegistry();
  const allPromises = registry.map(file => fetchEntitiesBatch(file));
  const results = await Promise.all(allPromises);
  return results.flat();
};

