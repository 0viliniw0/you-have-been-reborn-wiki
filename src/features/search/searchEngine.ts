import Fuse from 'fuse.js';
import { BaseEntity } from '../../shared/types/entities';

let fuse: Fuse<BaseEntity> | null = null;

export const initSearchIndex = (entities: BaseEntity[]) => {
  fuse = new Fuse(entities, {
    keys: [
      'name.ru', 'name.en', 
      'description.ru', 'description.en', 
      'tags', 'category'
    ],
    threshold: 0.3,
    ignoreLocation: true,
  });
};

export const searchEntities = (query: string): BaseEntity[] => {
  if (!fuse || !query) return [];
  return fuse.search(query).map(result => result.item);
};
