import { BaseEntity, EntityType } from "../types/entities";

// Metadata file that tracks all data files for automatic discovery
export interface DataRegistry {
  [key: string]: string[];
}

export const fetchRegistry = async (): Promise<DataRegistry> => {
  const response = await fetch("/data/registry.json");
  return response.json();
};

export const fetchEntitiesBatch = async <T extends BaseEntity>(
  type: EntityType,
  fileName: string,
): Promise<T[]> => {
  const response = await fetch(`/data/${type}/${fileName}`);
  if (!response.ok) throw new Error(`Failed to load ${type}/${fileName}`);
  return response.json();
};

export const loadAllEntities = async (): Promise<BaseEntity[]> => {
  console.log("loadAllEntities");
  const registry = await fetchRegistry();
  const allPromises: Promise<BaseEntity[]>[] = [];

  for (const [type, files] of Object.entries(registry)) {
    files.forEach((file) => {
      console.log("file", file);

      allPromises.push(fetchEntitiesBatch(type as EntityType, file));
    });
  }
  console.log("results1");

  const results = await Promise.all(allPromises);
  console.log("results", results);

  return results.flat();
};
