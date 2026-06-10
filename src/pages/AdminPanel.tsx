import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Entity, EntityCategory } from "../shared/types/entities";
import { loadAllEntities } from "../shared/api/dataService";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "../shared/ui/LanguageSwitcher";

export default function AdminPanel() {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const currentLang = i18n.language.split("-")[0] as "ru" | "en";

  const [draftEntities, setDraftEntities] = useState<Entity[]>([]);
  const [deletedIds, setDeletedIds] = useState<string[]>([]);
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);
  const [dirHandle, setDirHandle] = useState<any>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);

  // Helper to save/load handle from IndexedDB
  const getDB = () => {
    return new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open("WikiEditorDB", 1);
      request.onupgradeneeded = () => request.result.createObjectStore("handles");
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  };

  useEffect(() => {
    // Restore drafts and deletions
    const savedDrafts = localStorage.getItem("wiki_draft_entities");
    if (savedDrafts) setDraftEntities(JSON.parse(savedDrafts));

    const savedDeleted = localStorage.getItem("wiki_deleted_ids");
    if (savedDeleted) setDeletedIds(JSON.parse(savedDeleted));

    const restoreHandle = async () => {
      try {
        const db = await getDB();
        const tx = db.transaction("handles", "readonly");
        const handle = await new Promise<any>((res) => {
          const req = tx.objectStore("handles").get("publicFolder");
          req.onsuccess = () => res(req.result);
        });

        if (handle) {
          setDirHandle(handle);
          const mode = "readwrite";
          if ((await handle.queryPermission({ mode })) === "granted") {
            setIsAuthorized(true);
          }
        }
      } catch (e) {
        console.warn("Could not restore folder handle", e);
      }
    };
    restoreHandle();
  }, []);

  const connectToFolder = async () => {
    try {
      let handle = dirHandle;
      const mode = "readwrite";
      
      if (!handle) {
        handle = await (window as any).showDirectoryPicker();
      }

      if ((await handle.queryPermission({ mode })) !== "granted") {
        await handle.requestPermission({ mode });
      }
      
      if ((await handle.queryPermission({ mode })) === "granted") {
        const db = await getDB();
        const tx = db.transaction("handles", "readwrite");
        tx.objectStore("handles").put(handle, "publicFolder");
        setDirHandle(handle);
        setIsAuthorized(true);
      }
    } catch (err) {
      console.error(err);
      alert("Connection failed or access denied");
    }
  };

  const uploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!dirHandle || !selectedEntity) {
      alert("Please connect to 'public' folder first!");
      return;
    }

    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const imgDir = await dirHandle.getDirectoryHandle("images", { create: true });
      const ext = file.name.split('.').pop();
      const fileName = `${selectedEntity.category}_${selectedEntity.slug}_${Date.now()}.${ext}`;
      
      const fileHandle = await imgDir.getFileHandle(fileName, { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(file);
      await writable.close();

      updateField("image", `/images/${fileName}`);
      alert("Image uploaded!");
    } catch (err) {
      console.error(err);
      alert("Upload failed: " + (err as Error).message);
    }
  };

  const deleteImage = async () => {
    if (!dirHandle || !selectedEntity?.image) return;
    try {
      const fileName = selectedEntity.image.split('/').pop()!;
      const imgDir = await dirHandle.getDirectoryHandle("images");
      await imgDir.removeEntry(fileName);
      updateField("image", "");
      alert("Image deleted from disk");
    } catch (err) {
      updateField("image", "");
    }
  };

  const saveToFiles = async () => {
    if (!dirHandle) {
      alert("Please connect to 'public' folder first!");
      return;
    }

    try {
      const dataDir = await dirHandle.getDirectoryHandle("data");
      
      // Group drafts by category
      const groups: Record<string, Entity[]> = {};
      draftEntities.forEach(entity => {
        if (!groups[entity.category]) groups[entity.category] = [];
        groups[entity.category].push(entity);
      });

      // Group deletions by category
      const deletionsByCategory: Record<string, string[]> = {};
      deletedIds.forEach(id => {
        const entity = dbEntities?.find(e => e.id === id);
        if (entity) {
          if (!deletionsByCategory[entity.category]) deletionsByCategory[entity.category] = [];
          deletionsByCategory[entity.category].push(id);
        }
      });

      const allAffectedCategories = new Set([
        ...Object.keys(groups),
        ...Object.keys(deletionsByCategory)
      ]);

      for (const category of allAffectedCategories) {
        const fileName = `${category}.json`;
        const fileHandle = await dataDir.getFileHandle(fileName, { create: true });
        
        // Load existing data
        let existingData: any[] = [];
        try {
          const file = await fileHandle.getFile();
          const text = await file.text();
          if (text) existingData = JSON.parse(text);
        } catch (e) { /* New or empty file */ }

        // Apply deletions
        let updatedData = existingData.filter(e => !(deletionsByCategory[category] || []).includes(e.id));

        // Apply updates/adds
        const entitiesToUpdate = groups[category] || [];
        entitiesToUpdate.forEach(entity => {
          const index = updatedData.findIndex(e => e.id === entity.id);
          if (index > -1) {
            updatedData[index] = entity;
          } else {
            updatedData.push(entity);
          }
        });

        // Write back
        const writable = await fileHandle.createWritable();
        await writable.write(JSON.stringify(updatedData, null, 2));
        await writable.close();
      }

      alert("Successfully saved to disk!");
      setDraftEntities([]);
      setDeletedIds([]);
      localStorage.removeItem("wiki_draft_entities");
      localStorage.removeItem("wiki_deleted_ids");
      setSelectedEntity(null);
      queryClient.invalidateQueries({ queryKey: ["entities"] });
    } catch (err) {
      console.error(err);
      alert("Error saving: " + (err as Error).message);
    }
  };

  const { data: dbEntities } = useQuery({
    queryKey: ["entities", "all"],
    queryFn: loadAllEntities,
  });

  const allAvailableEntities: Entity[] = [...(dbEntities || []), ...draftEntities];

  const saveToLocal = (newEntities: Entity[]) => {
    setDraftEntities(newEntities);
    localStorage.setItem("wiki_draft_entities", JSON.stringify(newEntities));
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
  ])).filter(id => !deletedIds.includes(id));

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center font-sans p-6 text-white">
        <div className="max-w-md w-full text-center space-y-8">
          <div className="inline-block p-8 bg-blue-600 rounded-[3rem] shadow-[0_0_50px_rgba(37,99,235,0.3)] animate-pulse">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/></svg>
          </div>
          <div className="space-y-4">
            <h1 className="text-5xl font-black tracking-tight bg-gradient-to-br from-white to-gray-500 bg-clip-text text-transparent">Wiki Editor</h1>
            <p className="text-gray-400 text-lg leading-relaxed">
              To manage content, you must grant access to your project's <code className="text-blue-400 font-bold">/public</code> folder.
            </p>
          </div>
          <button
            onClick={connectToFolder}
            className="group relative w-full flex justify-center py-5 px-4 border border-transparent text-xl font-black rounded-3xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-2xl"
          >
            {dirHandle ? "🔓 Unlock Session" : "📁 Select /public Folder"}
          </button>
          <p className="text-xs text-gray-600 font-medium">
            Strictly local access. No data leaves your machine.
          </p>
        </div>
      </div>
    );
  }

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
            className={`w-full py-3 rounded-lg font-bold border-2 transition-all flex items-center justify-center gap-2 ${dirHandle ? 'border-green-500 text-green-600 bg-green-50' : 'border-blue-600 text-blue-600 hover:bg-blue-50 animate-pulse'}`}
          >
            {dirHandle ? "✅ Local Sync Active" : "🔗 Connect Local Folder"}
          </button>
          
          <button
            onClick={saveToFiles}
            disabled={!dirHandle || (draftEntities.length === 0 && deletedIds.length === 0)}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-bold disabled:opacity-30 disabled:grayscale hover:bg-green-700 transition-colors shadow-sm"
          >
            💾 Push Changes to Disk
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

            <div className="mb-6">
              <label className="block text-sm font-bold mb-1">
                Entity Image
              </label>
              <div className="flex items-center gap-4">
                {selectedEntity.image ? (
                  <div className="relative group w-24 h-24">
                    <img 
                      src={selectedEntity.image.startsWith('http') ? selectedEntity.image : `.${selectedEntity.image}`} 
                      className="w-24 h-24 object-cover rounded-lg border shadow-sm"
                      alt="Preview"
                    />
                    <button 
                      onClick={deleteImage}
                      className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Delete file from disk"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                    </button>
                  </div>
                ) : (
                  <div className="w-24 h-24 bg-gray-50 border-2 border-dashed rounded-lg flex items-center justify-center text-gray-400">
                    <span className="text-2xl">🖼️</span>
                  </div>
                )}
                
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={uploadImage}
                    className="hidden"
                    id="image-upload"
                  />
                  <label 
                    htmlFor="image-upload"
                    className="inline-block bg-blue-50 text-blue-600 px-4 py-2 rounded-lg border border-blue-200 font-bold text-sm cursor-pointer hover:bg-blue-100 transition-colors"
                  >
                    {selectedEntity.image ? "Replace Image" : "Upload to /public/images"}
                  </label>
                  <p className="text-[10px] text-gray-400 mt-1">
                    Directly saves to your project folder
                  </p>
                </div>
              </div>
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
                  if (confirm(t("admin.deleteConfirm") || "Are you sure?")) {
                    const isOriginal = dbEntities?.some(e => e.id === selectedEntity.id);
                    if (isOriginal) {
                      const newDeletedIds = [...deletedIds, selectedEntity.id];
                      setDeletedIds(newDeletedIds);
                      localStorage.setItem("wiki_deleted_ids", JSON.stringify(newDeletedIds));
                    }
                    
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
