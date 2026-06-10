import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { BaseEntity, Entity, EntityCategory } from "../shared/types/entities";
import { loadAllEntities, fetchRegistry } from "../shared/api/dataService";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "../shared/ui/LanguageSwitcher";

export default function AdminPanel() {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const currentLang = i18n.language.split("-")[0] as "ru" | "en";

  const [draftEntities, setDraftEntities] = useState<Entity[]>([]);
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);
  const [dirHandle, setDirHandle] = useState<any>(null);

  const { data: dbEntities } = useQuery({
    queryKey: ["entities", "all"],
    queryFn: loadAllEntities,
  });

  const allAvailableEntities: Entity[] = [...(dbEntities || []), ...draftEntities];

  useEffect(() => {
    const saved = localStorage.getItem("wiki_draft_entities");
    if (saved) setDraftEntities(JSON.parse(saved));
  }, []);

  const saveToLocal = (newEntities: Entity[]) => {
    setDraftEntities(newEntities);
    localStorage.setItem("wiki_draft_entities", JSON.stringify(newEntities));
  };

  const connectToFolder = async () => {
    try {
      const handle = await (window as any).showDirectoryPicker();
      setDirHandle(handle);
      alert("Connected to folder successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to connect to folder");
    }
  };

  const saveToFiles = async () => {
    if (!dirHandle) {
      alert("Please connect to public/data folder first!");
      return;
    }

    try {
      // Group entities by their category (file name is derived from category)
      const groups: Record<string, Entity[]> = {};
      
      draftEntities.forEach(entity => {
        if (!groups[entity.category]) groups[entity.category] = [];
        groups[entity.category].push(entity);
      });

      for (const [category, entities] of Object.entries(groups)) {
        const fileName = `${category}.json`;
        const fileHandle = await dirHandle.getFileHandle(fileName, { create: true });
        
        // 2. Load existing data
        let existingData: any[] = [];
        try {
          const file = await fileHandle.getFile();
          const text = await file.text();
          if (text) existingData = JSON.parse(text);
        } catch (e) { /* New or empty file */ }

        // 3. Merge
        const updatedData = [...existingData];
        entities.forEach(entity => {
          const index = updatedData.findIndex(e => e.id === entity.id);
          if (index > -1) {
            updatedData[index] = entity;
          } else {
            updatedData.push(entity);
          }
        });

        // 4. Write back
        const writable = await fileHandle.createWritable();
        await writable.write(JSON.stringify(updatedData, null, 2));
        await writable.close();
      }

      alert("Successfully saved to files!");
      setDraftEntities([]);
      localStorage.removeItem("wiki_draft_entities");
      setSelectedEntity(null);
      queryClient.invalidateQueries({ queryKey: ["entities"] });
    } catch (err) {
      console.error(err);
      alert("Error saving: " + (err as Error).message);
    }
  };

  const handleCreate = () => {
    const category: EntityCategory = "items";

    const newEntity: Entity = {
      id: crypto.randomUUID(),
      slug: "new-entity",
      name: { ru: "Новая сущность", en: "New Entity" },
      description: { ru: "", en: "" },
      category: category,
      tags: [],
      updatedAt: new Date().toISOString(),
    } as Entity;
    
    saveToLocal([...draftEntities, newEntity]);
    setSelectedEntity(newEntity);
  };

  const updateField = (field: string, value: unknown) => {
    if (!selectedEntity) return;
    
    const updated = { ...selectedEntity, [field]: value } as Entity;
    setSelectedEntity(updated);
    
    // Check if it's already in drafts
    const isAlreadyInDrafts = draftEntities.some(e => e.id === updated.id);
    
    let newDrafts: Entity[];
    if (isAlreadyInDrafts) {
      newDrafts = draftEntities.map((e) => e.id === updated.id ? updated : e);
    } else {
      newDrafts = [...draftEntities, updated];
    }
    saveToLocal(newDrafts);
  };

  const updateLocalizedField = (
    field: "name" | "description",
    lang: "ru" | "en",
    value: string,
  ) => {
    if (!selectedEntity) return;
    
    // Robust check: ensure field is an object
    const currentFieldValue = (selectedEntity as any)[field] || { ru: "", en: "" };
    const safeFieldValue = typeof currentFieldValue === 'string' 
      ? { ru: currentFieldValue, en: currentFieldValue } 
      : currentFieldValue;

    const updated = {
      ...selectedEntity,
      [field]: { ...safeFieldValue, [lang]: value },
    } as Entity;
    
    setSelectedEntity(updated);
    
    const isAlreadyInDrafts = draftEntities.some(e => e.id === updated.id);
    let newDrafts: Entity[];
    if (isAlreadyInDrafts) {
      newDrafts = draftEntities.map((e) => e.id === updated.id ? updated : e);
    } else {
      newDrafts = [...draftEntities, updated];
    }
    saveToLocal(newDrafts);
  };

  const renderRelationSelect = (
    label: string,
    field: string,
    filterCategory?: string,
  ) => {
    const options = allAvailableEntities.filter(
      (e) => !filterCategory || e.category === filterCategory,
    );
    return (
      <div className="mb-4">
        <label className="block text-sm font-bold mb-1">{label}</label>
        <select
          className="w-full p-2 border rounded bg-white"
          value={(selectedEntity as any)?.[field] || ""}
          onChange={(e) => updateField(field, e.target.value)}
        >
          <option value="">None</option>
          {options.map((opt) => (
            <option key={opt.id} value={opt.id}>
              {opt.name[currentLang] || opt.name["ru"]} (
              {t(`categories.${opt.category}`)})
            </option>
          ))}
        </select>
      </div>
    );
  };

  const renderArrayInput = (label: string, field: string) => {
    const values = (selectedEntity as any)?.[field] || [];
    return (
      <div className="mb-4">
        <label className="block text-sm font-bold mb-1">{label}</label>
        <input
          className="w-full p-2 border rounded"
          value={values.join(", ")}
          onChange={(e) =>
            updateField(
              field,
              e.target.value
                .split(",")
                .map((s: string) => s.trim())
                .filter(Boolean),
            )
          }
        />
      </div>
    );
  };

  const allIds = Array.from(new Set([
    ...(dbEntities?.map(e => e.id) || []),
    ...draftEntities.map(e => e.id)
  ]));

  return (
    <div className="min-h-screen bg-gray-100 p-8 flex gap-8 font-sans">
      <LanguageSwitcher />

      <div className="w-1/3 bg-white p-6 rounded-xl shadow-lg flex flex-col h-[85vh]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Content Manager</h2>
          <button
            onClick={handleCreate}
            className="bg-green-600 text-white px-3 py-1 rounded text-sm font-bold shadow-sm hover:bg-green-700"
          >
            + New
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto space-y-2 pr-2">
          {allIds.map((id) => {
            const draft = draftEntities.find(e => e.id === id);
            const db = dbEntities?.find(e => e.id === id);
            const entity = draft || db!;
            const isModified = !!draft && !!db;
            const isNew = !!draft && !db;

            return (
              <div
                key={id}
                onClick={() => setSelectedEntity(entity)}
                className={`p-3 border rounded-lg cursor-pointer transition-all ${selectedEntity?.id === id ? "bg-blue-50 border-blue-500 ring-2 ring-blue-200" : "bg-white hover:bg-gray-50 border-gray-100"}`}
              >
                <div className="flex justify-between items-start mb-1">
                  <div className="font-bold text-sm truncate pr-2">
                    {entity.name[currentLang] || entity.name["ru"]}
                  </div>
                  {isNew && <span className="bg-green-100 text-green-700 px-1.5 py-0.5 rounded text-[10px] font-black uppercase">New</span>}
                  {isModified && <span className="bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded text-[10px] font-black uppercase">Modified</span>}
                </div>
                <div className="text-[10px] text-gray-400 font-mono flex gap-2">
                  <span className="bg-gray-100 px-1 rounded uppercase">{entity.category}</span>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-6 pt-6 border-t space-y-2">
          <button
            onClick={connectToFolder}
            className={`w-full py-2 rounded-lg font-bold border-2 transition-colors ${dirHandle ? 'border-green-500 text-green-600 bg-green-50' : 'border-blue-600 text-blue-600 hover:bg-blue-50'}`}
          >
            {dirHandle ? "✅ Connected to /public/data" : "🔗 Connect to public/data"}
          </button>
          
          <button
            onClick={saveToFiles}
            disabled={!dirHandle || draftEntities.length === 0}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-700 transition-colors"
          >
            💾 Save All to Files
          </button>

          <button
            onClick={() => {
              const dataStr =
                "data:text/json;charset=utf-8," +
                encodeURIComponent(JSON.stringify(draftEntities, null, 2));
              const link = document.createElement("a");
              link.setAttribute("href", dataStr);
              link.setAttribute("download", `exported_entities.json`);
              link.click();
            }}
            className="w-full border border-gray-300 text-gray-600 py-2 rounded-lg font-bold hover:bg-gray-50 transition-colors text-sm"
          >
            {t("admin.export")} (JSON)
          </button>
        </div>
      </div>

      <div className="flex-1 bg-white p-8 rounded-xl shadow-lg overflow-y-auto h-[85vh]">
        {selectedEntity ? (
          <div className="max-w-2xl">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold">
                {t("admin.edit")}:{" "}
                <span className="text-blue-600">
                  {selectedEntity.name[currentLang] || selectedEntity.name["ru"]}
                </span>
              </h2>
              <div className="bg-gray-100 px-3 py-1 rounded text-xs font-mono text-gray-500">
                ID: {selectedEntity.id}
              </div>
            </div>

            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
              <label className="block text-xs font-bold mb-1 text-blue-800 uppercase">
                Category
              </label>
              <select
                className="w-full p-2 border rounded bg-white text-sm"
                value={selectedEntity.category}
                onChange={(e) => updateField("category", e.target.value)}
              >
                {[
                  "items",
                  "mobs",
                  "npcs",
                  "locations",
                  "quests",
                  "recipes",
                  "skills",
                  "achievements",
                ].map((cat) => (
                  <option key={cat} value={cat}>
                    {t(`categories.${cat}`)}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-6 grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold mb-1">
                  {t("admin.fields.name")} (RU)
                </label>
                <input
                  className="w-full p-2 border rounded"
                  value={selectedEntity.name.ru}
                  onChange={(e) =>
                    updateLocalizedField("name", "ru", e.target.value)
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">
                  {t("admin.fields.name")} (EN)
                </label>
                <input
                  className="w-full p-2 border rounded"
                  value={selectedEntity.name.en}
                  onChange={(e) =>
                    updateLocalizedField("name", "en", e.target.value)
                  }
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-bold mb-1">
                {t("admin.fields.slug")}
              </label>
              <input
                className="w-full p-2 border rounded"
                value={selectedEntity.slug}
                onChange={(e) => updateField("slug", e.target.value)}
              />
            </div>

            <div className="mb-6 space-y-4">
              <div>
                <label className="block text-sm font-bold mb-1">
                  {t("admin.fields.description")} (RU)
                </label>
                <textarea
                  className="w-full p-2 border rounded h-24"
                  value={selectedEntity.description.ru}
                  onChange={(e) =>
                    updateLocalizedField("description", "ru", e.target.value)
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">
                  {t("admin.fields.description")} (EN)
                </label>
                <textarea
                  className="w-full p-2 border rounded h-24"
                  value={selectedEntity.description.en}
                  onChange={(e) =>
                    updateLocalizedField("description", "en", e.target.value)
                  }
                />
              </div>
            </div>

            {renderArrayInput(t("admin.fields.tags"), "tags")}

            <div className="mt-8 pt-8 border-t">
              <h3 className="text-lg font-bold mb-4 text-gray-400 uppercase tracking-widest text-xs">
                Entity Specific Fields
              </h3>

              {selectedEntity.category === "items" && (
                <>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-bold mb-1">
                        Item Type
                      </label>
                      <select
                        className="w-full p-2 border rounded bg-white"
                        value={(selectedEntity as any).type || ""}
                        onChange={(e) => updateField("type", e.target.value)}
                      >
                        <option value="weapon">Weapon</option>
                        <option value="armor">Armor</option>
                        <option value="consumable">Consumable</option>
                        <option value="material">Material</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-1">
                        Rarity
                      </label>
                      <select
                        className="w-full p-2 border rounded bg-white"
                        value={(selectedEntity as any).rarity || ""}
                        onChange={(e) => updateField("rarity", e.target.value)}
                      >
                        <option value="common">Common</option>
                        <option value="uncommon">Uncommon</option>
                        <option value="rare">Rare</option>
                        <option value="epic">Epic</option>
                        <option value="legendary">Legendary</option>
                      </select>
                    </div>
                  </div>
                  {renderRelationSelect(
                    "Related Recipe",
                    "recipeId",
                    "recipes",
                  )}
                </>
              )}

              {(selectedEntity.category === "mobs" ||
                selectedEntity.category === "npcs") &&
                renderRelationSelect(
                  t("categories.locations"),
                  "locationId",
                  "locations",
                )}

              {selectedEntity.category === "mobs" &&
                renderArrayInput("Drops (Item IDs)", "drops")}

              {selectedEntity.category === "quests" && (
                <>
                  {renderRelationSelect("Giver NPC", "giverNpcId", "npcs")}
                  {renderArrayInput("Rewards (Item IDs)", "rewards")}
                </>
              )}

              {selectedEntity.category === "recipes" && (
                <>
                  {renderRelationSelect(
                    t("categories.items"),
                    "resultItemId",
                    "items",
                  )}
                  {renderRelationSelect(
                    t("categories.npcs"),
                    "craftedByNpcId",
                    "npcs",
                  )}
                </>
              )}
            </div>

            <div className="mt-12 flex gap-4">
              <button
                onClick={() => {
                  if (confirm("Delete this draft?")) {
                    const newDrafts = draftEntities.filter(
                      (e) => e.id !== selectedEntity.id,
                    );
                    saveToLocal(newDrafts);
                    setSelectedEntity(null);
                  }
                }}
                className="bg-red-100 text-red-600 px-6 py-2 rounded-lg font-bold hover:bg-red-200"
              >
                {t("admin.delete")}
              </button>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-400">
            <div className="text-4xl mb-4">🛠️</div>
            <p>Select a draft or create a new one to start editing.</p>
          </div>
        )}
      </div>
    </div>
  );
}
