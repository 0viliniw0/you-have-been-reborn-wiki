import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Entity, Bestiary, Material } from "../shared/types/entities";
import { loadAllEntities } from "../shared/api/dataService";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "../shared/ui/LanguageSwitcher";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminPanel() {
  const { i18n } = useTranslation();
  const queryClient = useQueryClient();
  const currentLang = i18n.language.split("-")[0] as "ru" | "en";

  const [draftEntities, setDraftEntities] = useState<Entity[]>([]);
  const [deletedIds, setDeletedIds] = useState<string[]>([]);
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);
  const [dirHandle, setDirHandle] = useState<FileSystemDirectoryHandle | null>(
    null,
  );
  const [isAuthorized, setIsAuthorized] = useState(false);

  // Helper to save/load handle from IndexedDB
  const getDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open("WikiEditorDB", 1);
      request.onupgradeneeded = () =>
        request.result.createObjectStore("handles");
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
        const handle = await new Promise<FileSystemDirectoryHandle | undefined>(
          (res) => {
            const req = tx.objectStore("handles").get("publicFolder");
            req.onsuccess = () => res(req.result);
          },
        );

        if (handle) {
          setDirHandle(handle);
          const mode = "readwrite";
          // @ts-expect-error - File System Access API
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
      await queryClient.invalidateQueries({ queryKey: ["entities"] });
    } catch (err) {
      alert(err instanceof Error ? err.message : String(err));
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
    const value =
      ((entity as Record<string, unknown>)[field] as Record<string, number>) ||
      {};
    const [newKey, setNewKey] = useState("");
    const [newVal, setNewVal] = useState("");

    return (
      <div className="mb-6 p-6 bg-slate-50 dark:bg-slate-900/50 rounded-[2rem] border border-slate-200 dark:border-slate-800">
        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">
          {label}
        </label>
        <div className="space-y-2 mb-4">
          {Object.entries(value).map(([k, v]) => (
            <div key={k} className="flex gap-2">
              <input
                readOnly
                value={k}
                className="flex-1 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-mono"
              />
              <input
                readOnly
                value={String(v)}
                className="w-24 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-black text-blue-600"
              />
              <button
                onClick={() => {
                  const next = { ...value };
                  delete next[k];
                  updateField(field, next);
                }}
                className="p-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-colors"
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
            className="flex-1 p-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm"
          />
          <input
            placeholder="Val"
            type="number"
            value={newVal}
            onChange={(e) => setNewVal(e.target.value)}
            className="w-24 p-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm"
          />
          <button
            onClick={() => {
              if (newKey) {
                updateField(field, { ...value, [newKey]: Number(newVal) });
                setNewKey("");
                setNewVal("");
              }
            }}
            className="bg-blue-600 text-white px-6 rounded-xl font-black"
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
    const value = selectedEntity
      ? (selectedEntity as Record<string, unknown>)[field]
      : undefined;
    const options = allAvailableEntities.filter((e) => e.category === category);

    if (multiple) {
      const selectedIds = (value as string[]) || [];
      return (
        <div className="mb-6">
          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">
            {label}
          </label>
          <div className="flex flex-wrap gap-2 mb-3">
            {selectedIds.map((id: string) => {
              const e = allAvailableEntities.find((x) => x.id === id);
              return (
                <span
                  key={id}
                  className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border border-blue-100 dark:border-blue-800/50"
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
            className="w-full p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-bold appearance-none outline-none focus:border-blue-500 transition-colors"
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
        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
          {label}
        </label>
        <select
          className="w-full p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-bold appearance-none outline-none focus:border-blue-500 transition-colors"
          value={(value as string) || ""}
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
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-blue-600/5 blur-[100px] rounded-full -translate-x-1/2 -translate-y-1/2"></div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full text-center space-y-12 relative z-10"
        >
          <div className="w-24 h-24 bg-blue-600 rounded-[2.5rem] flex items-center justify-center text-4xl font-black mx-auto shadow-2xl shadow-blue-500/50">
            W
          </div>
          <div>
            <h1 className="text-5xl font-black tracking-tighter mb-4">
              Content Editor
            </h1>
            <p className="text-slate-400 font-medium">
              Connect your local /public folder to start editing Wiki content
              directly from your browser.
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={connectToFolder}
            className="w-full py-6 px-8 bg-blue-600 rounded-[2rem] text-xl font-black shadow-xl shadow-blue-500/20"
          >
            📁 Unlock Workspace
          </motion.button>
        </motion.div>
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans">
      <div className="flex-1 flex overflow-hidden h-screen">
        {/* Sidebar */}
        <div className="w-80 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col">
          <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
            <h2 className="text-xl font-black tracking-tight">Library</h2>
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
                  requirements: { level: 1 },
                };
                updateField("id", ent.id);
                setSelectedEntity(ent);
              }}
              className="bg-blue-600 text-white p-2 rounded-xl text-xs font-black shadow-lg shadow-blue-500/20"
            >
              + NEW
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {allAvailableEntities.map((e) => {
              const isDraft = draftEntities.some((d) => d.id === e.id);
              const isActive = selectedEntity?.id === e.id;
              return (
                <button
                  key={e.id}
                  onClick={() => setSelectedEntity(e)}
                  className={`w-full p-4 rounded-2xl text-left transition-all border ${isActive ? "bg-blue-600 border-blue-500 shadow-xl shadow-blue-500/10" : "bg-transparent border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/50"}`}
                >
                  <div
                    className={`font-black text-sm mb-1 ${isActive ? "text-white" : "text-slate-900 dark:text-slate-100"}`}
                  >
                    {e.name[currentLang] || e.name.ru}
                  </div>
                  <div className="flex items-center justify-between">
                    <div
                      className={`text-[10px] uppercase font-black ${isActive ? "text-blue-200" : "text-slate-400"}`}
                    >
                      {e.category}
                    </div>
                    {isDraft && (
                      <span className="w-2 h-2 bg-amber-500 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.5)]"></span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
            <LanguageSwitcher />
          </div>
        </div>

        {/* Editor Area */}
        <div className="flex-1 flex flex-col bg-slate-100 dark:bg-slate-950 overflow-hidden relative">
          <AnimatePresence mode="wait">
            {selectedEntity ? (
              <motion.div
                key={selectedEntity.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex-1 overflow-y-auto p-12"
              >
                <div className="max-w-3xl mx-auto pb-32">
                  <header className="mb-12">
                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em] mb-4 block">
                      Editing Mode
                    </span>
                    <h2 className="text-5xl font-black tracking-tighter mb-2 italic">
                      {selectedEntity.name[currentLang]}
                    </h2>
                    <p className="text-slate-400 font-medium font-mono text-xs">
                      {selectedEntity.id}
                    </p>
                  </header>

                  <div className="space-y-12">
                    {/* General Section */}
                    <div className="grid grid-cols-2 gap-8">
                      <div className="col-span-2">
                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">
                          Category
                        </label>
                        <select
                          className="w-full p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-bold shadow-sm outline-none focus:border-blue-500 transition-colors"
                          value={selectedEntity.category}
                          onChange={(e) =>
                            updateField("category", e.target.value)
                          }
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

                      <div className="col-span-1">
                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 text-slate-400">
                          Name (RU)
                        </label>
                        <input
                          className="w-full p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-bold shadow-sm outline-none focus:border-blue-500"
                          value={selectedEntity.name.ru}
                          onChange={(e) =>
                            updateLocalizedField("name", "ru", e.target.value)
                          }
                        />
                      </div>
                      <div className="col-span-1">
                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">
                          Name (EN)
                        </label>
                        <input
                          className="w-full p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-bold shadow-sm outline-none focus:border-blue-500"
                          value={selectedEntity.name.en}
                          onChange={(e) =>
                            updateLocalizedField("name", "en", e.target.value)
                          }
                        />
                      </div>

                      <div className="col-span-2">
                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">
                          Slug (Unique ID)
                        </label>
                        <input
                          className="w-full p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-mono shadow-sm outline-none focus:border-blue-500"
                          value={selectedEntity.slug}
                          onChange={(e) => updateField("slug", e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Image Section */}
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">
                        Entity Media
                      </label>
                      <div className="flex gap-6 items-center p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] shadow-sm">
                        <div className="w-20 h-20 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
                          {selectedEntity.image && (
                            <img
                              src={
                                selectedEntity.image.startsWith("http")
                                  ? selectedEntity.image
                                  : `.${selectedEntity.image}`
                              }
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <div className="flex-1">
                          <input
                            type="file"
                            onChange={uploadImage}
                            className="text-xs font-bold text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-black file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100 transition-all cursor-pointer"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Description Section */}
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">
                        Description Content
                      </label>
                      <div className="space-y-4">
                        <textarea
                          className="w-full p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] h-48 text-sm leading-relaxed shadow-sm outline-none focus:border-blue-500"
                          value={selectedEntity.description.ru}
                          onChange={(e) =>
                            updateLocalizedField(
                              "description",
                              "ru",
                              e.target.value,
                            )
                          }
                          placeholder="Описание (RU)"
                        />
                        <textarea
                          className="w-full p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] h-48 text-sm leading-relaxed shadow-sm outline-none focus:border-blue-500"
                          value={selectedEntity.description.en}
                          onChange={(e) =>
                            updateLocalizedField(
                              "description",
                              "en",
                              e.target.value,
                            )
                          }
                          placeholder="Description (EN)"
                        />
                      </div>
                    </div>

                    {/* Category Specific Sections */}
                    <div className="border-t border-slate-200 dark:border-slate-800 pt-12 space-y-12">
                      {selectedEntity.category === "skills" && (
                        <div className="grid grid-cols-2 gap-8">
                          <div className="col-span-1">
                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                              Mana Cost
                            </label>
                            <input
                              type="number"
                              className="w-full p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-black text-blue-600 outline-none"
                              value={selectedEntity.manaCost || 0}
                              onChange={(e) =>
                                updateField("manaCost", Number(e.target.value))
                              }
                            />
                          </div>
                          <div className="col-span-1">
                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                              Cooldown (s)
                            </label>
                            <input
                              type="number"
                              className="w-full p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-black text-blue-600 outline-none"
                              value={selectedEntity.cooldown || 0}
                              onChange={(e) =>
                                updateField("cooldown", Number(e.target.value))
                              }
                            />
                          </div>
                        </div>
                      )}

                      {selectedEntity.category === "equipment" && (
                        <div className="space-y-8">
                          <div className="grid grid-cols-2 gap-8">
                            <div>
                              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                                Type
                              </label>
                              <select
                                className="w-full p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-bold"
                                value={selectedEntity.type}
                                onChange={(e) =>
                                  updateField("type", e.target.value)
                                }
                              >
                                <option value="weapon">Weapon</option>
                                <option value="armor">Armor</option>
                                <option value="accessory">Accessory</option>
                              </select>
                            </div>
                          </div>
                          <ObjectMapInput
                            label="Combat Stats"
                            field="stats"
                            entity={selectedEntity}
                          />
                        </div>
                      )}

                      {selectedEntity.category === "bestiary" && (
                        <div className="space-y-8">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">
                                Creature Behavior
                              </label>
                              <select
                                className="w-full px-6 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl text-sm font-bold focus:ring-2 focus:ring-blue-500 transition-all appearance-none"
                                value={
                                  (selectedEntity as Bestiary).behavior ||
                                  "aggressive"
                                }
                                onChange={(e) =>
                                  updateField("behavior", e.target.value)
                                }
                              >
                                <option value="aggressive">Aggressive</option>
                                <option value="boss">Boss</option>
                                <option value="passive">Passive</option>
                                <option value="peaceful">Peaceful</option>
                              </select>
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">
                                Level
                              </label>
                              <input
                                type="number"
                                className="w-full px-6 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl text-sm font-bold focus:ring-2 focus:ring-blue-500 transition-all"
                                value={(selectedEntity as Bestiary).level || 0}
                                onChange={(e) =>
                                  updateField("level", parseInt(e.target.value))
                                }
                              />
                            </div>
                          </div>
                          <RelationSelect
                            label="Habitat Location"
                            field="locationId"
                            category="locations"
                          />
                          <ObjectMapInput
                            label="Combat Stats"
                            field="stats"
                            entity={selectedEntity}
                          />
                        </div>
                      )}

                      {selectedEntity.category === "materials" && (
                        <div className="space-y-8">
                          <div className="col-span-1">
                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 text-slate-400">
                              Source (RU)
                            </label>
                            <input
                              className="w-full p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-bold shadow-sm outline-none focus:border-blue-500"
                              value={
                                (selectedEntity as Material).source?.ru || ""
                              }
                              onChange={(e) => {
                                const current = (selectedEntity as Material)
                                  .source || { ru: "", en: "" };
                                updateField("source", {
                                  ...current,
                                  ru: e.target.value,
                                });
                              }}
                            />
                          </div>
                          <div className="col-span-1">
                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 text-slate-400">
                              Source (EN)
                            </label>
                            <input
                              className="w-full p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-bold shadow-sm outline-none focus:border-blue-500"
                              value={
                                (selectedEntity as Material).source?.en || ""
                              }
                              onChange={(e) => {
                                const current = (selectedEntity as Material)
                                  .source || { ru: "", en: "" };
                                updateField("source", {
                                  ...current,
                                  en: e.target.value,
                                });
                              }}
                            />
                          </div>
                        </div>
                      )}

                      {selectedEntity.category === "locations" && (
                        <RelationSelect
                          label="Parent Zone"
                          field="parentLocationId"
                          category="locations"
                        />
                      )}

                      {selectedEntity.category === "npcs" && (
                        <RelationSelect
                          label="Spawn Location"
                          field="locationId"
                          category="locations"
                        />
                      )}

                      {selectedEntity.category === "quests" && (
                        <div className="space-y-8">
                          <RelationSelect
                            label="Quest Giver"
                            field="giverNpcId"
                            category="npcs"
                          />
                          <RelationSelect
                            label="Prerequisite Quest"
                            field="chainParentId"
                            category="quests"
                          />
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="border-t border-slate-200 dark:border-slate-800 pt-12">
                      <button
                        onClick={() => {
                          if (confirm("Permanently delete this entity?")) {
                            if (
                              dbEntities?.find(
                                (x) => x.id === selectedEntity.id,
                              )
                            ) {
                              setDeletedIds([...deletedIds, selectedEntity.id]);
                              localStorage.setItem(
                                "wiki_deleted_ids",
                                JSON.stringify([
                                  ...deletedIds,
                                  selectedEntity.id,
                                ]),
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
                        className="w-full py-4 bg-red-50 dark:bg-red-950/20 text-red-600 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-red-100 transition-colors"
                      >
                        Delete Entity from Database
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                <div className="w-20 h-20 bg-slate-100 dark:bg-slate-900 rounded-[2rem] flex items-center justify-center text-3xl mb-6">
                  📂
                </div>
                <h3 className="text-2xl font-black mb-2 italic">
                  No Selection
                </h3>
                <p className="text-slate-400 font-medium max-w-xs mx-auto">
                  Select an entity from the sidebar to begin editing or create a
                  new one.
                </p>
              </div>
            )}
          </AnimatePresence>

          {/* Floating Save Button */}
          <AnimatePresence>
            {(draftEntities.length > 0 || deletedIds.length > 0) && (
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 50 }}
                className="absolute bottom-8 right-8 z-30"
              >
                <motion.button
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={saveToFiles}
                  className="px-10 py-5 bg-blue-600 text-white rounded-[2rem] font-black text-lg shadow-2xl shadow-blue-500/50 flex items-center gap-4"
                >
                  <span>
                    Push {draftEntities.length + deletedIds.length} Changes to
                    Disk
                  </span>
                  <span className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-sm italic">
                    S
                  </span>
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
