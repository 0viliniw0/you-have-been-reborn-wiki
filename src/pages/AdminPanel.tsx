import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Entity, Bestiary, Recipe } from "../shared/types/entities";

import { loadAllEntities } from "../shared/api/dataService";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "../shared/ui/LanguageSwitcher";
import { motion, AnimatePresence } from "framer-motion";

const STORAGE_KEY = "wiki_editor_state";

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
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

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
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const { drafts = [], deleted = [] } = JSON.parse(saved);
      setDraftEntities(drafts);
      setDeletedIds(deleted);
    }

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
    const updated = {
      ...selectedEntity,
      [field]: value,
      updatedAt: new Date().toISOString(), // ← добавить
    } as Entity;
    setSelectedEntity(updated);
    const index = draftEntities.findIndex((e) => e.id === updated.id);
    let newDrafts: Entity[];
    if (index > -1) {
      newDrafts = draftEntities.map((e) => (e.id === updated.id ? updated : e));
    } else {
      newDrafts = [...draftEntities, updated];
    }
    setDraftEntities(newDrafts);
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ drafts: newDrafts, deleted: deletedIds }),
    );
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

      // ИСПРАВЛЕНИЕ 3: deletions ищем в allAvailableEntities, а не только в dbEntities
      const deletionsByCategory: Record<string, string[]> = {};
      deletedIds.forEach((id) => {
        const entity = allAvailableEntities.find((e) => e.id === id);
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
        // ИСПРАВЛЕНИЕ 2: не используем create:true при чтении — отдельно пробуем прочитать
        let existingData: Entity[] = [];
        try {
          const handle = await dataDir.getFileHandle(`${cat}.json`);
          const file = await handle.getFile();
          const text = await file.text();
          if (text.trim()) existingData = JSON.parse(text) as Entity[];
        } catch {
          // Файл не существует — начинаем с пустого массива, это нормально
        }

        const currentDeletions = deletionsByCategory[cat] || [];
        const filtered = existingData.filter(
          (e) => !currentDeletions.includes(e.id),
        );

        const updated = [...filtered];
        (groups[cat] || []).forEach((e) => {
          const idx = updated.findIndex((ex) => ex.id === e.id);
          if (idx > -1) updated[idx] = e;
          else updated.push(e);
        });

        // Создаём/перезаписываем только при записи
        const writeHandle = await dataDir.getFileHandle(`${cat}.json`, {
          create: true,
        });
        const writable = await writeHandle.createWritable();
        await writable.write(JSON.stringify(updated, null, 2));
        await writable.close();
      }

      // Сбрасываем состояние
      setDraftEntities([]);
      setDeletedIds([]);
      localStorage.removeItem(STORAGE_KEY);
      setSelectedEntity(null);
      await queryClient.invalidateQueries({ queryKey: ["entities"] });

      alert("Saved!");
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
      <div className="mb-6 p-8 bg-slate-50 dark:bg-slate-900/50 rounded-[2.5rem] border border-slate-200 dark:border-slate-800">
        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 ml-4">
          {label}
        </label>
        <div className="space-y-3 mb-6">
          {Object.entries(value).map(([k, v]) => (
            <div key={k} className="flex gap-3 items-center">
              <div className="flex-1 flex gap-2">
                <input
                  readOnly
                  value={k}
                  className="flex-1 px-5 py-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl text-xs font-mono"
                />
                <input
                  readOnly
                  value={String(v)}
                  className="w-24 px-5 py-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl text-xs font-black text-blue-600 text-center"
                />
              </div>
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
            placeholder="Property Name"
            value={newKey}
            onChange={(e) => setNewKey(e.target.value)}
            className="flex-1 px-5 py-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
          />
          <input
            placeholder="Value"
            type="number"
            value={newVal}
            onChange={(e) => setNewVal(e.target.value)}
            className="w-24 px-5 py-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
          />
          <button
            onClick={() => {
              if (newKey) {
                updateField(field, { ...value, [newKey]: Number(newVal) });
                setNewKey("");
                setNewVal("");
              }
            }}
            className="bg-blue-600 text-white px-6 rounded-xl font-black text-xs uppercase"
          >
            Add
          </button>
        </div>
      </div>
    );
  };

  const IngredientsInput = ({ entity }: { entity: Entity }) => {
    const recipe = entity as Recipe;
    const ingredients = recipe.ingredients || [];
    const [selectedId, setSelectedId] = useState("");
    const [quantity, setQuantity] = useState(1);

    const addIngredient = () => {
      if (!selectedId) return;
      if (ingredients.find((i) => i.id === selectedId)) return;
      updateField("ingredients", [
        ...ingredients,
        { id: selectedId, quantity },
      ]);
      setSelectedId("");
      setQuantity(1);
    };

    const removeIngredient = (id: string) => {
      updateField(
        "ingredients",
        ingredients.filter((i) => i.id !== id),
      );
    };

    return (
      <div className="p-10 bg-slate-50 dark:bg-slate-900/50 rounded-[3rem] border border-slate-200 dark:border-slate-800">
        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-8 ml-4">
          Ingredients Required
        </h4>
        <div className="space-y-3 mb-8">
          {ingredients.length === 0 && (
            <div className="text-center py-8 text-slate-400 text-xs font-bold uppercase tracking-widest bg-white dark:bg-slate-950 rounded-3xl border-2 border-dashed border-slate-100 dark:border-slate-800/50">
              No Ingredients Added
            </div>
          )}
          {ingredients.map((ing) => {
            const item = allAvailableEntities.find((e) => e.id === ing.id);
            return (
              <div
                key={ing.id}
                className="flex items-center justify-between p-5 bg-white dark:bg-slate-950 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-xl shadow-inner group-hover:scale-110 transition-transform">
                    {item?.image ? (
                      <img
                        src={
                          item.image.startsWith("http")
                            ? item.image
                            : `.${item.image}`
                        }
                        className="w-full h-full object-contain p-2"
                        alt=""
                      />
                    ) : (
                      <span className="opacity-20 text-xs">📦</span>
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-black">
                      {item?.name[currentLang] || item?.name["ru"] || ing.id}
                    </div>
                    <div className="text-[10px] text-blue-600 uppercase font-black tracking-widest">
                      Quantity: {ing.quantity}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => removeIngredient(ing.id)}
                  className="p-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-all hover:scale-110 active:scale-90"
                >
                  ✕
                </button>
              </div>
            );
          })}
        </div>
        <div className="flex gap-3">
          <select
            className="flex-1 px-6 py-4 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-bold appearance-none focus:ring-2 focus:ring-blue-500/20 outline-none"
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
          >
            <option value="">Select Item...</option>
            {allAvailableEntities
              .filter((e) =>
                ["materials", "equipment", "consumables"].includes(e.category),
              )
              .map((e) => (
                <option key={e.id} value={e.id}>
                  [{e.category.toUpperCase()}]{" "}
                  {e.name[currentLang] || e.name["ru"]}
                </option>
              ))}
          </select>
          <input
            type="number"
            className="w-24 px-6 py-4 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-black text-center focus:ring-2 focus:ring-blue-500/20 outline-none"
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value))}
          />
          <button
            onClick={addIngredient}
            className="px-8 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all"
          >
            Add
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
        <div className="mb-8">
          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 ml-4">
            {label}
          </label>
          <div className="flex flex-wrap gap-2 mb-4 p-6 bg-slate-50 dark:bg-slate-900/50 rounded-[2.5rem] border border-slate-200 dark:border-slate-800">
            {selectedIds.length === 0 && (
              <span className="text-[10px] font-bold text-slate-400 uppercase p-2">
                None Selected
              </span>
            )}
            {selectedIds.map((id: string) => {
              const e = allAvailableEntities.find((x) => x.id === id);
              return (
                <span
                  key={id}
                  className="bg-blue-600 text-white pl-4 pr-2 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-blue-500/20"
                >
                  {e?.name[currentLang] || id}
                  <button
                    onClick={() =>
                      updateField(
                        field,
                        selectedIds.filter((x: string) => x !== id),
                      )
                    }
                    className="w-5 h-5 flex items-center justify-center bg-blue-700 rounded-lg hover:bg-red-500 transition-colors"
                  >
                    ✕
                  </button>
                </span>
              );
            })}
          </div>
          <select
            className="w-full px-8 py-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] text-sm font-bold appearance-none outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
            onChange={(e) => {
              if (e.target.value && !selectedIds.includes(e.target.value)) {
                updateField(field, [...selectedIds, e.target.value]);
              }
            }}
            value=""
          >
            <option value="">Add to {label}...</option>
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
      <div className="mb-8">
        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 ml-4">
          {label}
        </label>
        <select
          className="w-full px-8 py-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] text-sm font-bold appearance-none outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
          value={(value as string) || ""}
          onChange={(e) => updateField(field, e.target.value)}
        >
          <option value="">Select {label}...</option>
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
        <div className="w-96 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col">
          <div className="p-8 border-b border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black tracking-tighter italic">
                Library
              </h2>
              <button
                onClick={() => {
                  const ent: Entity = {
                    id: crypto.randomUUID(),
                    slug: "new-" + Date.now(),
                    name: { ru: "Новый", en: "New" },
                    description: { ru: "", en: "" },
                    category: "skills",
                    tags: [],
                    updatedAt: new Date().toISOString(),
                    manaCost: 0,
                    cooldown: 0,
                    requirements: { level: 1 },
                  } as Entity;

                  // Сразу добавляем в drafts — не через updateField
                  const newDrafts = [...draftEntities, ent];
                  setDraftEntities(newDrafts);
                  localStorage.setItem(
                    STORAGE_KEY,
                    JSON.stringify({ drafts: newDrafts, deleted: deletedIds }),
                  );
                  setSelectedEntity(ent);
                }}
                className="bg-blue-600 text-white px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:scale-105 transition-transform"
              >
                + Create New
              </button>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  🔍
                </span>
                <input
                  type="text"
                  placeholder="Search entities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-blue-500/20 outline-none"
                />
              </div>

              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide no-scrollbar">
                {[
                  "all",
                  "skills",
                  "equipment",
                  "consumables",
                  "materials",
                  "bestiary",
                  "locations",
                  "npcs",
                  "recipes",
                ].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${
                      selectedCategory === cat
                        ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {allAvailableEntities
              .filter((e) => {
                const matchesSearch =
                  e.name[currentLang]
                    ?.toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                  e.slug.toLowerCase().includes(searchTerm.toLowerCase());
                const matchesCat =
                  selectedCategory === "all" || e.category === selectedCategory;
                return matchesSearch && matchesCat;
              })
              .map((e) => {
                const isDraft = draftEntities.some((d) => d.id === e.id);
                const isActive = selectedEntity?.id === e.id;
                return (
                  <button
                    key={e.id}
                    onClick={() => setSelectedEntity(e)}
                    className={`w-full p-5 rounded-[1.8rem] text-left transition-all border group relative ${
                      isActive
                        ? "bg-blue-600 border-blue-500 shadow-2xl shadow-blue-500/20 translate-x-1"
                        : "bg-transparent border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-12 h-12 rounded-2xl flex-shrink-0 flex items-center justify-center text-xl shadow-inner ${
                          isActive
                            ? "bg-blue-500"
                            : "bg-slate-100 dark:bg-slate-800"
                        }`}
                      >
                        {e.image ? (
                          <img
                            src={
                              e.image.startsWith("http")
                                ? e.image
                                : `.${e.image}`
                            }
                            className="w-full h-full object-cover rounded-2xl"
                            alt=""
                          />
                        ) : (
                          <span className="opacity-30">🖼️</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div
                          className={`font-black text-sm mb-1 truncate ${isActive ? "text-white" : "text-slate-900 dark:text-slate-100"}`}
                        >
                          {e.name[currentLang] || e.name.ru}
                        </div>
                        <div className="flex items-center justify-between">
                          <div
                            className={`text-[9px] uppercase font-black tracking-widest ${isActive ? "text-blue-200" : "text-slate-400"}`}
                          >
                            {e.category}
                          </div>
                          {isDraft && (
                            <span className="px-2 py-0.5 bg-amber-500 text-[8px] font-black text-white rounded-full uppercase tracking-tighter">
                              Draft
                            </span>
                          )}
                        </div>
                      </div>
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
                <div className="max-w-4xl mx-auto pb-32">
                  <header className="mb-12 flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em] mb-4 block">
                        Content Editor
                      </span>
                      <h2 className="text-6xl font-black tracking-tighter mb-4 italic">
                        {selectedEntity.name[currentLang]}
                      </h2>
                      <div className="flex items-center gap-4">
                        <span className="px-3 py-1 bg-slate-200 dark:bg-slate-800 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-500">
                          ID: {selectedEntity.id}
                        </span>
                        <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-[10px] font-black uppercase tracking-widest text-blue-600">
                          {selectedEntity.category}
                        </span>
                      </div>
                    </div>
                  </header>

                  <div className="space-y-12">
                    {/* Visuals Section */}
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-sm">
                      <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-8 ml-4">
                        Entity Appearance
                      </h3>
                      <div className="flex flex-col md:flex-row gap-12 items-center">
                        <div className="w-64 h-64 bg-slate-50 dark:bg-slate-800 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 overflow-hidden flex items-center justify-center relative group">
                          {selectedEntity.image ? (
                            <img
                              src={
                                selectedEntity.image.startsWith("http")
                                  ? selectedEntity.image
                                  : `.${selectedEntity.image}`
                              }
                              className="w-full h-full object-contain p-8"
                              alt=""
                            />
                          ) : (
                            <span className="text-6xl grayscale opacity-10">
                              🖼️
                            </span>
                          )}
                          <label className="absolute inset-0 bg-blue-600/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer text-white">
                            <span className="text-2xl mb-2">📤</span>
                            <span className="text-[10px] font-black uppercase tracking-widest">
                              Change Image
                            </span>
                            <input
                              type="file"
                              className="hidden"
                              onChange={uploadImage}
                              accept="image/*"
                            />
                          </label>
                        </div>
                        <div className="flex-1 space-y-6 w-full">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">
                              Image Path
                            </label>
                            <input
                              className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border border-transparent rounded-3xl text-sm font-mono focus:ring-2 focus:ring-blue-500/20 outline-none"
                              value={selectedEntity.image || ""}
                              onChange={(e) =>
                                updateField("image", e.target.value)
                              }
                              placeholder="/images/example.png"
                            />
                          </div>
                          <div className="p-6 bg-blue-50/50 dark:bg-blue-900/10 rounded-3xl border border-blue-100 dark:border-blue-900/20">
                            <p className="text-xs font-medium text-blue-600 dark:text-blue-400 leading-relaxed">
                              💡 Best images are transparent PNGs (512x512).
                              Uploads are automatically saved to your local{" "}
                              <code className="bg-blue-100 dark:bg-blue-900/50 px-1 rounded">
                                /public/images
                              </code>{" "}
                              folder.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Basic Info Section */}
                    <div className="p-12 bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-sm space-y-8">
                      <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 ml-4">
                        Basic Information
                      </h3>

                      <div className="grid grid-cols-2 gap-8">
                        <div className="col-span-2">
                          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-4">
                            Category
                          </label>
                          <select
                            className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 border-none rounded-[2rem] text-sm font-bold shadow-inner outline-none focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none"
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
                              "recipes",
                            ].map((c) => (
                              <option key={c} value={c}>
                                {c.toUpperCase()}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="col-span-1">
                          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-4">
                            Name (RU)
                          </label>
                          <input
                            className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 border-none rounded-[2rem] text-sm font-bold shadow-inner outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                            value={selectedEntity.name.ru}
                            onChange={(e) =>
                              updateLocalizedField("name", "ru", e.target.value)
                            }
                          />
                        </div>
                        <div className="col-span-1">
                          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-4">
                            Name (EN)
                          </label>
                          <input
                            className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 border-none rounded-[2rem] text-sm font-bold shadow-inner outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                            value={selectedEntity.name.en}
                            onChange={(e) =>
                              updateLocalizedField("name", "en", e.target.value)
                            }
                          />
                        </div>

                        <div className="col-span-2">
                          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-4">
                            Slug (Unique URL)
                          </label>
                          <input
                            className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 border-none rounded-[2rem] text-sm font-mono shadow-inner outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                            value={selectedEntity.slug}
                            onChange={(e) =>
                              updateField("slug", e.target.value)
                            }
                          />
                        </div>
                      </div>
                    </div>

                    {/* Description Section */}
                    <div className="p-12 bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-sm space-y-8">
                      <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 ml-4">
                        Description Content
                      </h3>
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">
                            Russian Description
                          </label>
                          <textarea
                            className="w-full p-8 bg-slate-50 dark:bg-slate-800 border-none rounded-[2.5rem] h-64 text-sm leading-relaxed shadow-inner outline-none focus:ring-2 focus:ring-blue-500/20"
                            value={selectedEntity.description.ru}
                            onChange={(e) =>
                              updateLocalizedField(
                                "description",
                                "ru",
                                e.target.value,
                              )
                            }
                            placeholder="Markdown supported..."
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">
                            English Description
                          </label>
                          <textarea
                            className="w-full p-8 bg-slate-50 dark:bg-slate-800 border-none rounded-[2.5rem] h-64 text-sm leading-relaxed shadow-inner outline-none focus:ring-2 focus:ring-blue-500/20"
                            value={selectedEntity.description.en}
                            onChange={(e) =>
                              updateLocalizedField(
                                "description",
                                "en",
                                e.target.value,
                              )
                            }
                            placeholder="Markdown supported..."
                          />
                        </div>
                      </div>
                    </div>

                    {/* Category Specific Sections */}
                    <div className="p-12 bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-sm space-y-8">
                      <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 ml-4">
                        Technical Details
                      </h3>
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
                          <div className="mb-6 p-8 bg-slate-50 dark:bg-slate-900/50 rounded-[2.5rem] border border-slate-200 dark:border-slate-800">
                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 ml-4">
                              Drops
                            </label>
                            <div className="space-y-2 mb-4">
                              {(selectedEntity.drops || []).map((drop, idx) => (
                                <div key={idx} className="flex gap-2">
                                  <select
                                    className="flex-1 px-5 py-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl text-xs font-mono"
                                    value={drop.id}
                                    onChange={(e) => {
                                      const next = [
                                        ...(selectedEntity.drops || []),
                                      ];
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
                                    className="w-24 px-5 py-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl text-xs font-black text-blue-600 text-center"
                                    value={drop.chance}
                                    onChange={(e) => {
                                      const next = [
                                        ...(selectedEntity.drops || []),
                                      ];
                                      next[idx] = {
                                        ...next[idx],
                                        chance: Number(e.target.value),
                                      };
                                      updateField("drops", next);
                                    }}
                                  />
                                  <button
                                    onClick={() =>
                                      updateField(
                                        "drops",
                                        (selectedEntity.drops || []).filter(
                                          (_, i) => i !== idx,
                                        ),
                                      )
                                    }
                                    className="p-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-colors"
                                  >
                                    ✕
                                  </button>
                                </div>
                              ))}
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

                      {selectedEntity.category === "recipes" && (
                        <div className="space-y-8">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <RelationSelect
                              label="Resulting Item"
                              field="resultId"
                              category="equipment" // Could be multiple, but usually equipment/consumables
                            />
                            <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">
                                Result Quantity
                              </label>
                              <input
                                type="number"
                                className="w-full px-6 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl text-sm font-bold focus:ring-2 focus:ring-blue-500 transition-all"
                                value={
                                  (selectedEntity as Recipe).resultQuantity || 1
                                }
                                onChange={(e) =>
                                  updateField(
                                    "resultQuantity",
                                    parseInt(e.target.value),
                                  )
                                }
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <RelationSelect
                              label="Crafting Station (Optional)"
                              field="stationId"
                              category="locations"
                            />
                          </div>

                          <IngredientsInput entity={selectedEntity} />
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="border-t border-slate-200 dark:border-slate-800 pt-12">
                      <button
                        onClick={() => {
                          if (confirm("Permanently delete this entity?")) {
                            const newDeleted = [
                              ...deletedIds,
                              selectedEntity.id,
                            ];
                            const newDrafts = draftEntities.filter(
                              (x) => x.id !== selectedEntity.id,
                            );
                            setDeletedIds(newDeleted);
                            setDraftEntities(newDrafts);
                            localStorage.setItem(
                              STORAGE_KEY,
                              JSON.stringify({
                                drafts: newDrafts,
                                deleted: newDeleted,
                              }),
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
