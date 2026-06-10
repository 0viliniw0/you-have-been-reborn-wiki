import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Entity } from "../shared/types/entities";
import { loadAllEntities } from "../shared/api/dataService";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "../shared/ui/LanguageSwitcher";

export default function AdminPanel() {
  const { i18n } = useTranslation();
  const queryClient = useQueryClient();
  const currentLang = i18n.language.split("-")[0] as "ru" | "en";

  const [draftEntities, setDraftEntities] = useState<Entity[]>([]);
  const [deletedIds, setDeletedIds] = useState<string[]>([]);
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);
  const [dirHandle, setDirHandle] = useState<FileSystemDirectoryHandle | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);

  // Helper to save/load handle from IndexedDB
  const getDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open("WikiEditorDB", 1);
      request.onupgradeneeded = () => request.result.createObjectStore("handles");
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  };

  useEffect(() => {
    const savedDrafts = localStorage.getItem("wiki_draft_entities");
    if (savedDrafts) setDraftEntities(JSON.parse(savedDrafts));

    const savedDeleted = localStorage.getItem("wiki_deleted_ids");
    if (savedDeleted) setDeletedIds(JSON.parse(savedDeleted));

    const restoreHandle = async () => {
      try {
        const db = await getDB();
        const tx = db.transaction("handles", "readonly");
        const handle = await new Promise<FileSystemDirectoryHandle | undefined>((res) => {
          const req = tx.objectStore("handles").get("publicFolder");
          req.onsuccess = () => res(req.result);
        });

        if (handle) {
          setDirHandle(handle);
          const mode = "readwrite";
          // @ts-expect-error - File System Access API types are not fully standard yet
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
      // @ts-expect-error - File System Access API
      if (!handle) handle = await window.showDirectoryPicker();
      if (!handle) return;

      // @ts-expect-error - File System Access API
      if ((await handle.queryPermission({ mode })) !== "granted") {
        // @ts-expect-error - File System Access API
        await handle.requestPermission({ mode });
      }

      // @ts-expect-error - File System Access API
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


  const updateField = (field: string, value: unknown) => {
    if (!selectedEntity) return;
    const updated = { ...selectedEntity, [field]: value } as Entity;
    setSelectedEntity(updated);
    const index = draftEntities.findIndex((e) => e.id === updated.id);
    let newDrafts: Entity[];
    if (index > -1) {
      newDrafts = draftEntities.map((e) => (e.id === updated.id ? updated : e));
    } else {
      newDrafts = [...draftEntities, updated];
    }
    setDraftEntities(newDrafts);
    localStorage.setItem("wiki_draft_entities", JSON.stringify(newDrafts));
  };

  const updateLocalizedField = (
    field: "name" | "description",
    lang: "ru" | "en",
    value: string,
  ) => {
    if (!selectedEntity) return;
    const current = selectedEntity[field];
    updateField(field, { ...current, [lang]: value });
  };

  const uploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!dirHandle || !selectedEntity) return;
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const imgDir = await dirHandle.getDirectoryHandle("images", {
        create: true,
      });
      const ext = file.name.split(".").pop();
      const fileName = `${selectedEntity.category}_${selectedEntity.slug}_${Date.now()}.${ext}`;
      const fileHandle = await imgDir.getFileHandle(fileName, { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(file);
      await writable.close();
      updateField("image", `/images/${fileName}`);
    } catch (err) {
      console.error(err);
    }
  };

  const saveToFiles = async () => {
    if (!dirHandle) return;
    try {
      const dataDir = await dirHandle.getDirectoryHandle("data");
      const groups: Record<string, Entity[]> = {};
      draftEntities.forEach((e) => {
        if (!groups[e.category]) groups[e.category] = [];
        groups[e.category].push(e);
      });

      const deletionsByCategory: Record<string, string[]> = {};
      deletedIds.forEach((id) => {
        const entity = dbEntities?.find((e) => e.id === id);
        if (entity) {
          if (!deletionsByCategory[entity.category])
            deletionsByCategory[entity.category] = [];
          deletionsByCategory[entity.category].push(id);
        }
      });

      const allCats = new Set([
        ...Object.keys(groups),
        ...Object.keys(deletionsByCategory),
      ]);
      for (const cat of allCats) {
        const handle = await dataDir.getFileHandle(`${cat}.json`, {
          create: true,
        });
        let data: Entity[] = [];
        try {
          const file = await handle.getFile();
          const text = await file.text();
          if (text) data = JSON.parse(text) as Entity[];
        } catch {
          // File might not exist yet
        }

        const currentDeletions = deletionsByCategory[cat] || [];
        const filteredData = data.filter(
          (e) => !currentDeletions.includes(e.id),
        );
        
        const updated = [...filteredData];
        (groups[cat] || []).forEach((e) => {
          const idx = updated.findIndex((ex) => ex.id === e.id);
          if (idx > -1) updated[idx] = e;
          else updated.push(e);
        });

        // @ts-expect-error - File System Access API
        const writable = await handle.createWritable();
        await writable.write(JSON.stringify(updated, null, 2));
        await writable.close();
      }

      alert("Saved!");
      setDraftEntities([]);
      setDeletedIds([]);
      localStorage.removeItem("wiki_draft_entities");
      localStorage.removeItem("wiki_deleted_ids");
      setSelectedEntity(null);
      queryClient.invalidateQueries({ queryKey: ["entities"] });
    } catch (err) {
      alert(err);
    }
  };

  const { data: dbEntities } = useQuery({
    queryKey: ["entities", "all"],
    queryFn: loadAllEntities,
  });

  // Create a combined list where drafts override DB entities
  const allAvailableEntities = (() => {
    const map = new Map<string, Entity>();
    dbEntities?.forEach((e) => map.set(e.id, e));
    draftEntities.forEach((e) => map.set(e.id, e));
    deletedIds.forEach((id) => map.delete(id));
    return Array.from(map.values());
  })();

  const ObjectMapInput = ({
    label,
    field,
    entity,
  }: {
    label: string;
    field: string;
    entity: Entity;
  }) => {
    const value = (entity as unknown as Record<string, Record<string, number>>)[field] || {};
    const [newKey, setNewKey] = useState("");
    const [newVal, setNewVal] = useState("");

    return (
      <div className="mb-6 p-4 bg-gray-50 rounded-xl border">
        <label className="block text-xs font-black uppercase text-gray-400 mb-2">
          {label}
        </label>
        <div className="space-y-2 mb-4">
          {Object.entries(value).map(([k, v]) => (
            <div key={k} className="flex gap-2">
              <input
                readOnly
                value={k}
                className="flex-1 p-2 bg-white border rounded text-sm font-mono"
              />
              <input
                readOnly
                value={String(v)}
                className="w-24 p-2 bg-white border rounded text-sm font-bold"
              />
              <button
                onClick={() => {
                  const next = { ...value };
                  delete next[k];
                  updateField(field, next);
                }}
                className="text-red-500 p-2"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            placeholder="Key"
            value={newKey}
            onChange={(e) => setNewKey(e.target.value)}
            className="flex-1 p-2 border rounded text-sm"
          />
          <input
            placeholder="Value"
            type="number"
            value={newVal}
            onChange={(e) => setNewVal(e.target.value)}
            className="w-24 p-2 border rounded text-sm"
          />
          <button
            onClick={() => {
              if (newKey) {
                updateField(field, { ...value, [newKey]: Number(newVal) });
                setNewKey("");
                setNewVal("");
              }
            }}
            className="bg-blue-600 text-white px-4 rounded font-bold"
          >
            +
          </button>
        </div>
      </div>
    );
  };

  const RelationSelect = ({
    label,
    field,
    category,
    multiple = false,
  }: {
    label: string;
    field: string;
    category: string;
    multiple?: boolean;
  }) => {
    const value = (selectedEntity as unknown as Record<string, string | string[]>)?.[field];
    const options = allAvailableEntities.filter((e) => e.category === category);

    if (multiple) {
      const selectedIds = value || [];
      return (
        <div className="mb-6">
          <label className="block text-sm font-bold mb-2">{label}</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {selectedIds.map((id: string) => {
              const e = allAvailableEntities.find((x) => x.id === id);
              return (
                <span
                  key={id}
                  className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2"
                >
                  {e?.name[currentLang] || id}
                  <button
                    onClick={() =>
                      updateField(
                        field,
                        selectedIds.filter((x: string) => x !== id),
                      )
                    }
                  >
                    ✕
                  </button>
                </span>
              );
            })}
          </div>
          <select
            className="w-full p-2 border rounded"
            onChange={(e) => {
              if (e.target.value && !selectedIds.includes(e.target.value)) {
                updateField(field, [...selectedIds, e.target.value]);
              }
            }}
            value=""
          >
            <option value="">Add {label}...</option>
            {options.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name[currentLang]}
              </option>
            ))}
          </select>
        </div>
      );
    }

    return (
      <div className="mb-6">
        <label className="block text-sm font-bold mb-1">{label}</label>
        <select
          className="w-full p-2 border rounded"
          value={value || ""}
          onChange={(e) => updateField(field, e.target.value)}
        >
          <option value="">None</option>
          {options.map((o) => (
            <option key={o.id} value={o.id}>
              {o.name[currentLang]}
            </option>
          ))}
        </select>
      </div>
    );
  };

  if (!isAuthorized)
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-white">
        <div className="max-w-md w-full text-center space-y-8">
          <h1 className="text-5xl font-black tracking-tight">
            RPG Wiki Editor
          </h1>
          <button
            onClick={connectToFolder}
            className="w-full py-5 px-4 bg-blue-600 rounded-3xl text-xl font-black"
          >
            📁 Select /public Folder
          </button>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-100 p-8 flex gap-8 font-sans">
      <LanguageSwitcher />
      <div className="w-1/3 bg-white p-6 rounded-xl shadow-lg flex flex-col h-[85vh]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Content</h2>
          <button
            onClick={() => {
              const ent: Entity = {
                id: crypto.randomUUID(),
                slug: "new",
                name: { ru: "Новый", en: "New" },
                description: { ru: "", en: "" },
                category: "skills",
                tags: [],
                updatedAt: new Date().toISOString(),
                manaCost: 0,
                cooldown: 0,
                requirements: { level: 1 }
              };
              updateField("id", ent.id);
              setSelectedEntity(ent);
            }}
            className="bg-green-600 text-white px-3 py-1 rounded text-sm font-bold"
          >
            + New
          </button>
        </div>
        <div className="flex-1 overflow-y-auto space-y-2 pr-2">
          {allAvailableEntities.map((e) => {
            const isDraft = draftEntities.some((d) => d.id === e.id);
            return (
              <div
                key={e.id}
                onClick={() => setSelectedEntity(e)}
                className={`p-3 border rounded-lg cursor-pointer transition-all ${selectedEntity?.id === e.id ? "bg-blue-50 border-blue-500 shadow-md" : "bg-white hover:border-gray-300"}`}
              >
                <div className="flex justify-between items-start">
                  <div className="font-bold text-sm">
                    {e.name[currentLang] || e.name.ru}
                  </div>
                  {isDraft && (
                    <span className="text-[9px] bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded font-black uppercase">
                      Draft
                    </span>
                  )}
                </div>
                <div className="text-[10px] uppercase text-gray-400 font-bold">
                  {e.category}
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-6 space-y-2">
          <button
            onClick={saveToFiles}
            disabled={draftEntities.length === 0 && deletedIds.length === 0}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-bold disabled:opacity-30"
          >
            💾 Push Changes to Disk
          </button>
        </div>
      </div>

      <div className="flex-1 bg-white p-8 rounded-xl shadow-lg overflow-y-auto h-[85vh]">
        {selectedEntity ? (
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold mb-6">
              Edit {selectedEntity.category}:{" "}
              <span className="text-blue-600">
                {selectedEntity.name[currentLang]}
              </span>
            </h2>

            <div className="mb-6">
              <label className="block text-xs font-bold uppercase text-gray-400 mb-2">
                Category
              </label>
              <select
                className="w-full p-2 border rounded"
                value={selectedEntity.category}
                onChange={(e) => updateField("category", e.target.value)}
              >
                {[
                  "skills",
                  "equipment",
                  "consumables",
                  "materials",
                  "bestiary",
                  "locations",
                  "npcs",
                  "quests",
                ].map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-bold mb-1">
                  Name (RU)
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
                  Name (EN)
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
              <label className="block text-sm font-bold mb-1">Slug</label>
              <input
                className="w-full p-2 border rounded"
                value={selectedEntity.slug}
                onChange={(e) => updateField("slug", e.target.value)}
              />
            </div>

            <div className="mb-8">
              <label className="block text-sm font-bold mb-2">Image</label>
              <input
                type="file"
                onChange={uploadImage}
                className="w-full text-sm"
              />
            </div>

            <div className="mb-6">
              <label className="block text-xs font-bold uppercase text-gray-400 mb-2">
                Description (Markdown)
              </label>
              <div className="grid grid-cols-2 gap-4">
                <textarea
                  className="w-full p-2 border rounded h-32 text-sm"
                  value={selectedEntity.description.ru}
                  onChange={(e) =>
                    updateLocalizedField("description", "ru", e.target.value)
                  }
                  placeholder="Описание (RU)"
                />
                <textarea
                  className="w-full p-2 border rounded h-32 text-sm"
                  value={selectedEntity.description.en}
                  onChange={(e) =>
                    updateLocalizedField("description", "en", e.target.value)
                  }
                  placeholder="Description (EN)"
                />
              </div>
            </div>

            {selectedEntity.category === "skills" && (
              <>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-bold mb-1">
                      Mana Cost
                    </label>
                    <input
                      type="number"
                      className="w-full p-2 border rounded"
                      value={selectedEntity.manaCost || 0}
                      onChange={(e) =>
                        updateField("manaCost", Number(e.target.value))
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-1">
                      Cooldown
                    </label>
                    <input
                      type="number"
                      className="w-full p-2 border rounded"
                      value={selectedEntity.cooldown || 0}
                      onChange={(e) =>
                        updateField("cooldown", Number(e.target.value))
                      }
                    />
                  </div>
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-bold mb-1">
                    Required Level
                  </label>
                  <input
                    type="number"
                    className="w-full p-2 border rounded"
                    value={selectedEntity.requirements?.level || 0}
                    onChange={(e) =>
                      updateField("requirements", {
                        ...selectedEntity.requirements,
                        level: Number(e.target.value),
                      })
                    }
                  />
                </div>
              </>
            )}

            {selectedEntity.category === "equipment" && (
              <>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-bold mb-1">Type</label>
                    <select
                      className="w-full p-2 border rounded"
                      value={selectedEntity.type}
                      onChange={(e) => updateField("type", e.target.value)}
                    >
                      <option value="weapon">Weapon</option>
                      <option value="armor">Armor</option>
                      <option value="accessory">Accessory</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-1">
                      Rarity
                    </label>
                    <select
                      className="w-full p-2 border rounded"
                      value={selectedEntity.rarity}
                      onChange={(e) => updateField("rarity", e.target.value)}
                    >
                      <option value="common">Common</option>
                      <option value="uncommon">Uncommon</option>
                      <option value="rare">Rare</option>
                      <option value="epic">Epic</option>
                      <option value="legendary">Legendary</option>
                      <option value="artifact">Artifact</option>
                    </select>
                  </div>
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-bold mb-1">
                    Required Level
                  </label>
                  <input
                    type="number"
                    className="w-full p-2 border rounded"
                    value={selectedEntity.requirements?.level || 0}
                    onChange={(e) =>
                      updateField("requirements", {
                        ...selectedEntity.requirements,
                        level: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <ObjectMapInput
                  label="Stats"
                  field="stats"
                  entity={selectedEntity}
                />
              </>
            )}

            {selectedEntity.category === "consumables" && (
              <>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-bold mb-1">
                      Effect (RU)
                    </label>
                    <input
                      className="w-full p-2 border rounded"
                      value={selectedEntity.effect?.ru || ""}
                      onChange={(e) =>
                        updateField("effect", {
                          ...selectedEntity.effect,
                          ru: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-1">
                      Effect (EN)
                    </label>
                    <input
                      className="w-full p-2 border rounded"
                      value={selectedEntity.effect?.en || ""}
                      onChange={(e) =>
                        updateField("effect", {
                          ...selectedEntity.effect,
                          en: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-bold mb-1">
                    Duration (seconds)
                  </label>
                  <input
                    type="number"
                    className="w-full p-2 border rounded"
                    value={selectedEntity.duration || 0}
                    onChange={(e) =>
                      updateField("duration", Number(e.target.value))
                    }
                  />
                </div>
              </>
            )}

            {selectedEntity.category === "materials" && (
              <>
                <div className="mb-6">
                  <label className="block text-sm font-bold mb-1">Rarity</label>
                  <select
                    className="w-full p-2 border rounded"
                    value={selectedEntity.rarity}
                    onChange={(e) => updateField("rarity", e.target.value)}
                  >
                    <option value="common">Common</option>
                    <option value="uncommon">Uncommon</option>
                    <option value="rare">Rare</option>
                    <option value="epic">Epic</option>
                    <option value="legendary">Legendary</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-bold mb-1">
                      Source (RU)
                    </label>
                    <input
                      className="w-full p-2 border rounded"
                      value={selectedEntity.source?.ru || ""}
                      onChange={(e) =>
                        updateField("source", {
                          ...selectedEntity.source,
                          ru: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-1">
                      Source (EN)
                    </label>
                    <input
                      className="w-full p-2 border rounded"
                      value={selectedEntity.source?.en || ""}
                      onChange={(e) =>
                        updateField("source", {
                          ...selectedEntity.source,
                          en: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </>
            )}

            {selectedEntity.category === "bestiary" && (
              <>
                <div className="flex items-center gap-2 mb-6">
                  <input
                    type="checkbox"
                    checked={selectedEntity.isBoss}
                    onChange={(e) => updateField("isBoss", e.target.checked)}
                  />
                  <label className="font-bold">Is BOSS?</label>
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-bold mb-1">Level</label>
                  <input
                    type="number"
                    className="w-full p-2 border rounded"
                    value={selectedEntity.level || 0}
                    onChange={(e) =>
                      updateField("level", Number(e.target.value))
                    }
                  />
                </div>
                <RelationSelect
                  label="Location"
                  field="locationId"
                  category="locations"
                />
                <ObjectMapInput
                  label="Combat Stats"
                  field="stats"
                  entity={selectedEntity}
                />
                <div className="mb-6 p-4 bg-gray-50 rounded-xl border">
                  <label className="block text-xs font-black uppercase text-gray-400 mb-2">
                    Drops
                  </label>
                  <div className="space-y-2 mb-4">
                    {(selectedEntity.drops || []).map(
                      (drop, idx) => (
                        <div key={idx} className="flex gap-2">
                          <select
                            className="flex-1 p-2 border rounded text-sm"
                            value={drop.id}
                            onChange={(e) => {
                              const next = [...(selectedEntity.drops || [])];
                              next[idx] = {
                                ...next[idx],
                                id: e.target.value,
                              };
                              updateField("drops", next);
                            }}
                          >
                            <option value="">Select item...</option>
                            {allAvailableEntities
                              .filter((x) =>
                                [
                                  "equipment",
                                  "consumables",
                                  "materials",
                                ].includes(x.category),
                              )
                              .map((x) => (
                                <option key={x.id} value={x.id}>
                                  {x.name[currentLang]}
                                </option>
                              ))}
                          </select>
                          <input
                            type="number"
                            placeholder="%"
                            className="w-20 p-2 border rounded text-sm"
                            value={drop.chance}
                            onChange={(e) => {
                              const next = [...(selectedEntity.drops || [])];
                              next[idx] = {
                                ...next[idx],
                                chance: Number(e.target.value),
                              };
                              updateField("drops", next);
                            }}
                          />
                          <button
                            onClick={() => updateField(
                                  "drops",
                                  (selectedEntity.drops || []).filter(
                                    (_, i) => i !== idx,
                                  ),
                                )
                              }
                            className="text-red-500 p-2"
                          >
                            ✕
                          </button>
                        </div>
                      ),
                    )}
                  </div>
                  <button
                    onClick={() =>
                      updateField("drops", [
                        ...(selectedEntity.drops || []),
                        { id: "", chance: 10 },
                      ])
                    }
                    className="text-blue-600 font-bold text-sm"
                  >
                    + Add Drop
                  </button>
                </div>
              </>
            )}

            {selectedEntity.category === "locations" && (
              <>
                <div className="mb-6">
                  <label className="block text-sm font-bold mb-1">Type</label>
                  <select
                    className="w-full p-2 border rounded"
                    value={selectedEntity.type}
                    onChange={(e) => updateField("type", e.target.value)}
                  >
                    <option value="city">City</option>
                    <option value="zone">Zone</option>
                    <option value="dungeon">Dungeon</option>
                    <option value="raid">Raid</option>
                  </select>
                </div>
                <RelationSelect
                  label="Parent Location"
                  field="parentLocationId"
                  category="locations"
                />
              </>
            )}

            {selectedEntity.category === "npcs" && (
              <>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-bold mb-1">
                      Role (RU)
                    </label>
                    <input
                      className="w-full p-2 border rounded"
                      value={selectedEntity.role?.ru || ""}
                      onChange={(e) =>
                        updateField("role", {
                          ...selectedEntity.role,
                          ru: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-1">
                      Role (EN)
                    </label>
                    <input
                      className="w-full p-2 border rounded"
                      value={selectedEntity.role?.en || ""}
                      onChange={(e) =>
                        updateField("role", {
                          ...selectedEntity.role,
                          en: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <RelationSelect
                  label="Location"
                  field="locationId"
                  category="locations"
                />
              </>
            )}

            {selectedEntity.category === "quests" && (
              <>
                <RelationSelect
                  label="Quest Giver NPC"
                  field="giverNpcId"
                  category="npcs"
                />
                <div className="mb-6">
                  <label className="block text-sm font-bold mb-1">
                    Min Level
                  </label>
                  <input
                    type="number"
                    className="w-full p-2 border rounded"
                    value={selectedEntity.minLevel || 0}
                    onChange={(e) =>
                      updateField("minLevel", Number(e.target.value))
                    }
                  />
                </div>
                <div className="mb-6 p-4 bg-gray-50 rounded-xl border">
                  <label className="block text-xs font-black uppercase text-gray-400 mb-2">
                    Rewards
                  </label>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-[10px] font-bold">EXP</label>
                      <input
                        type="number"
                        className="w-full p-2 border rounded"
                        value={selectedEntity.rewards?.exp || 0}
                        onChange={(e) =>
                          updateField("rewards", {
                            ...selectedEntity.rewards,
                            exp: Number(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold">
                        Gold
                      </label>
                      <input
                        type="number"
                        className="w-full p-2 border rounded"
                        value={selectedEntity.rewards?.gold || 0}
                        onChange={(e) =>
                          updateField("rewards", {
                            ...selectedEntity.rewards,
                            gold: Number(e.target.value),
                          })
                        }
                      />
                    </div>
                  </div>
                  <RelationSelect
                    label="Reward Items"
                    field="items"
                    category="equipment"
                    multiple
                  />
                </div>
                <RelationSelect
                  label="Previous Quest (Chain)"
                  field="chainParentId"
                  category="quests"
                />
              </>
            )}

            <button
              onClick={() => {
                if (confirm("Delete?")) {
                  if (dbEntities?.find((x) => x.id === selectedEntity.id)) {
                    setDeletedIds([...deletedIds, selectedEntity.id]);
                    localStorage.setItem(
                      "wiki_deleted_ids",
                      JSON.stringify([...deletedIds, selectedEntity.id]),
                    );
                  }
                  const next = draftEntities.filter(
                    (x) => x.id !== selectedEntity.id,
                  );
                  setDraftEntities(next);
                  localStorage.setItem(
                    "wiki_draft_entities",
                    JSON.stringify(next),
                  );
                  setSelectedEntity(null);
                }
              }}
              className="mt-12 bg-red-100 text-red-600 px-6 py-2 rounded-lg font-bold hover:bg-red-200"
            >
              Delete Entity
            </button>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 text-xl font-bold">
            Select entity to edit
          </div>
        )}
      </div>
    </div>
  );
}
