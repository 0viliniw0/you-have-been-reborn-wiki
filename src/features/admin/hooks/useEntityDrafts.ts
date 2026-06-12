import { useState, useMemo, useEffect } from "react";
import { Entity, EntityCategory, BaseEntity } from "../../../shared/types/entities";
import { STORAGE_KEY, ENTITY_DEFAULTS } from "../lib/constants";

export const useEntityDrafts = (dbEntities: Entity[] | undefined) => {
  const [draftEntities, setDraftEntities] = useState<Entity[]>([]);
  const [deletedIds, setDeletedIds] = useState<string[]>([]);
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const { drafts = [], deleted = [] } = JSON.parse(saved);
        setDraftEntities(drafts);
        setDeletedIds(deleted);
      } catch (e) {
        console.error("Failed to parse editor state", e);
      }
    }
  }, []);

  const allAvailableEntities = useMemo(() => {
    const map = new Map<string, Entity>();
    dbEntities?.forEach((e) => map.set(e.id, e));
    draftEntities.forEach((e) => map.set(e.id, e));
    deletedIds.forEach((id) => map.delete(id));
    return Array.from(map.values());
  }, [dbEntities, draftEntities, deletedIds]);

  const selectedEntity = useMemo(
    () => allAvailableEntities.find((e) => e.id === selectedEntityId) || null,
    [allAvailableEntities, selectedEntityId]
  );

  const updateField = (field: string, value: unknown) => {
    if (!selectedEntity) return;

    let updated: Entity;

    if (field === "category") {
      const newCat = value as EntityCategory;
      const baseInfo: BaseEntity = {
        id: selectedEntity.id,
        slug: selectedEntity.slug,
        name: selectedEntity.name,
        description: selectedEntity.description,
        image: selectedEntity.image,
        tags: selectedEntity.tags,
        relatedIds: selectedEntity.relatedIds || [],
        category: newCat,
        updatedAt: new Date().toISOString(),
      };
      updated = { ...baseInfo, ...ENTITY_DEFAULTS[newCat] } as Entity;
    } else {
      updated = {
        ...selectedEntity,
        [field]: value,
        updatedAt: new Date().toISOString(),
      } as Entity;
    }

    const newDrafts = draftEntities.some((e) => e.id === updated.id)
      ? draftEntities.map((e) => (e.id === updated.id ? updated : e))
      : [...draftEntities, updated];

    setDraftEntities(newDrafts);
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ drafts: newDrafts, deleted: deletedIds })
    );
  };

  const updateLocalizedField = (
    field: "name" | "description",
    lang: "ru" | "en",
    value: string
  ) => {
    if (!selectedEntity) return;
    const current = selectedEntity[field];
    updateField(field, { ...current, [lang]: value });
  };

  const createNewEntity = () => {
    const ent: Entity = {
      id: crypto.randomUUID(),
      slug: "new-" + Date.now(),
      name: { ru: "Новая сущность", en: "New Entity" },
      description: { ru: "", en: "" },
      category: "skills",
      tags: [],
      updatedAt: new Date().toISOString(),
      ...ENTITY_DEFAULTS["skills"],
    } as Entity;

    const newDrafts = [...draftEntities, ent];
    setDraftEntities(newDrafts);
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ drafts: newDrafts, deleted: deletedIds })
    );
    setSelectedEntityId(ent.id);
  };

  const deleteEntity = (id: string) => {
    const newDeleted = [...deletedIds, id];
    const newDrafts = draftEntities.filter((x) => x.id !== id);
    setDeletedIds(newDeleted);
    setDraftEntities(newDrafts);
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ drafts: newDrafts, deleted: newDeleted })
    );
    if (selectedEntityId === id) setSelectedEntityId(null);
  };

  const resetState = () => {
    setDraftEntities([]);
    setDeletedIds([]);
    setSelectedEntityId(null);
  };

  return {
    draftEntities,
    deletedIds,
    selectedEntityId,
    setSelectedEntityId,
    selectedEntity,
    allAvailableEntities,
    updateField,
    updateLocalizedField,
    createNewEntity,
    deleteEntity,
    resetState,
  };
};
