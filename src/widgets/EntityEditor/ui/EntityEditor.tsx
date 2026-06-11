import { motion } from "framer-motion";
import {
  Entity,
  Bestiary,
  Recipe,
  Skill,
  Equipment,
  Location,
  Npc,
} from "../../../shared/types/entities";
import { ObjectMapInput } from "../../../features/admin/ui/ObjectMapInput";
import { IngredientsInput } from "../../../features/admin/ui/IngredientsInput";
import { RelationSelect } from "../../../features/admin/ui/RelationSelect";

interface EntityEditorProps {
  selectedEntity: Entity;
  allEntities: Entity[];
  currentLang: "ru" | "en";
  updateField: (field: string, value: unknown) => void;
  updateLocalizedField: (
    field: "name" | "description",
    lang: "ru" | "en",
    value: string,
  ) => void;
  uploadImage: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  deleteEntity: (id: string) => void;
}

export const EntityEditor = ({
  selectedEntity,
  allEntities,
  currentLang,
  updateField,
  updateLocalizedField,
  uploadImage,
  deleteEntity,
}: EntityEditorProps) => {
  return (
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
                  <span className="text-6xl grayscale opacity-10">🖼️</span>
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
                    onChange={(e) => updateField("image", e.target.value)}
                    placeholder="/images/example.png"
                  />
                </div>
                <div className="p-6 bg-blue-50/50 dark:bg-blue-900/10 rounded-3xl border border-blue-100 dark:border-blue-900/20">
                  <p className="text-xs font-medium text-blue-600 dark:text-blue-400 leading-relaxed">
                    💡 Best images are transparent PNGs (512x512). Uploads are
                    automatically saved to your local{" "}
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
                  onChange={(e) => updateField("slug", e.target.value)}
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
                    updateLocalizedField("description", "ru", e.target.value)
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
                    updateLocalizedField("description", "en", e.target.value)
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
              <div className="space-y-8">
                <div className="grid grid-cols-2 gap-8">
                  <div className="col-span-1">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                      Mana Cost
                    </label>
                    <input
                      type="number"
                      className="w-full p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-black text-blue-600 outline-none"
                      value={(selectedEntity as Skill).manaCost || 0}
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
                      value={(selectedEntity as Skill).cooldown || 0}
                      onChange={(e) =>
                        updateField("cooldown", Number(e.target.value))
                      }
                    />
                  </div>
                </div>
                <div className="p-8 bg-slate-50 dark:bg-slate-900/50 rounded-[2.5rem] border border-slate-200 dark:border-slate-800">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 ml-4">
                    Requirements
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="number"
                      placeholder="Level Required"
                      className="w-full p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-bold"
                      value={(selectedEntity as Skill).requirements?.level || 1}
                      onChange={(e) =>
                        updateField("requirements", {
                          ...(selectedEntity as Skill).requirements,
                          level: Number(e.target.value),
                        })
                      }
                    />
                  </div>
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
                      value={(selectedEntity as Equipment).type}
                      onChange={(e) => updateField("type", e.target.value)}
                    >
                      <option value="weapon">Weapon</option>
                      <option value="armor">Armor</option>
                      <option value="accessory">Accessory</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                      Slot
                    </label>
                    <input
                      placeholder="e.g. main-hand, chest"
                      className="w-full p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-bold"
                      value={(selectedEntity as Equipment).slot || ""}
                      onChange={(e) => updateField("slot", e.target.value)}
                    />
                  </div>
                </div>
                <div className="p-8 bg-slate-50 dark:bg-slate-900/50 rounded-[2.5rem] border border-slate-200 dark:border-slate-800">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 ml-4">
                    Requirements
                  </label>
                  <input
                    type="number"
                    placeholder="Level Required"
                    className="w-48 p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-bold"
                    value={
                      (selectedEntity as Equipment).requirements?.level || 1
                    }
                    onChange={(e) =>
                      updateField("requirements", {
                        ...(selectedEntity as Equipment).requirements,
                        level: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <RelationSelect
                  label="Inherent Skills"
                  field="skillIds"
                  categories={["skills"]}
                  multiple={true}
                  selectedEntity={selectedEntity}
                  allEntities={allEntities}
                  currentLang={currentLang}
                  updateField={updateField}
                />
                <ObjectMapInput
                  label="Combat Stats"
                  field="stats"
                  entity={selectedEntity}
                  updateField={updateField}
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
                        (selectedEntity as Bestiary).behavior || "aggressive"
                      }
                      onChange={(e) => updateField("behavior", e.target.value)}
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
                  label="Habitat Locations"
                  field="locationIds"
                  categories={["locations"]}
                  multiple={true}
                  selectedEntity={selectedEntity}
                  allEntities={allEntities}
                  currentLang={currentLang}
                  updateField={updateField}
                />
                <ObjectMapInput
                  label="Combat Stats"
                  field="stats"
                  entity={selectedEntity}
                  updateField={updateField}
                />
                <div className="mb-6 p-8 bg-slate-50 dark:bg-slate-900/50 rounded-[2.5rem] border border-slate-200 dark:border-slate-800">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 ml-4">
                    Drops
                  </label>
                  <div className="space-y-2 mb-4">
                    {((selectedEntity as Bestiary).drops || []).map(
                      (drop, idx) => (
                        <div key={idx} className="flex gap-2">
                          <select
                            className="flex-1 px-5 py-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl text-xs font-mono"
                            value={drop.id}
                            onChange={(e) => {
                              const next = [
                                ...((selectedEntity as Bestiary).drops || []),
                              ];
                              next[idx] = { ...next[idx], id: e.target.value };
                              updateField("drops", next);
                            }}
                          >
                            <option value="">Select item...</option>
                            {allEntities
                              .filter((x) =>
                                [
                                  "equipment",
                                  "consumables",
                                  "materials",
                                ].includes(x.category),
                              )
                              .map((x) => (
                                <option key={x.id} value={x.id}>
                                  [{x.category.toUpperCase()}] {x.name[currentLang] || x.name["ru"]}
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
                                ...((selectedEntity as Bestiary).drops || []),
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
                                ((selectedEntity as Bestiary).drops || []).filter(
                                  (_, i) => i !== idx,
                                ),
                              )
                            }
                            className="p-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-colors"
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
                        ...((selectedEntity as Bestiary).drops || []),
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
              <div className="space-y-8">
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                      Type
                    </label>
                    <select
                      className="w-full p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-bold"
                      value={(selectedEntity as Location).type}
                      onChange={(e) => updateField("type", e.target.value)}
                    >
                      <option value="city">City</option>
                      <option value="zone">Zone</option>
                      <option value="dungeon">Dungeon</option>
                      <option value="raid">Raid</option>
                    </select>
                  </div>
                </div>
                <RelationSelect
                  label="Parent Zone"
                  field="parentLocationId"
                  categories={["locations"]}
                  selectedEntity={selectedEntity}
                  allEntities={allEntities}
                  currentLang={currentLang}
                  updateField={updateField}
                />
              </div>
            )}

            {selectedEntity.category === "npcs" && (
              <div className="space-y-8">
                <div className="grid grid-cols-2 gap-8">
                  <div className="col-span-1">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-4">
                      Role (RU)
                    </label>
                    <input
                      className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 border-none rounded-[2rem] text-sm font-bold shadow-inner outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                      value={(selectedEntity as Npc).role?.ru || ""}
                      onChange={(e) => {
                        const current = (selectedEntity as Npc).role || {
                          ru: "",
                          en: "",
                        };
                        updateField("role", { ...current, ru: e.target.value });
                      }}
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-4">
                      Role (EN)
                    </label>
                    <input
                      className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 border-none rounded-[2rem] text-sm font-bold shadow-inner outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                      value={(selectedEntity as Npc).role?.en || ""}
                      onChange={(e) => {
                        const current = (selectedEntity as Npc).role || {
                          ru: "",
                          en: "",
                        };
                        updateField("role", { ...current, en: e.target.value });
                      }}
                    />
                  </div>
                </div>
                <RelationSelect
                  label="Spawn Locations"
                  field="locationIds"
                  categories={["locations"]}
                  multiple={true}
                  selectedEntity={selectedEntity}
                  allEntities={allEntities}
                  currentLang={currentLang}
                  updateField={updateField}
                />
              </div>
            )}

            {selectedEntity.category === "recipes" && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <RelationSelect
                    label="Resulting Item"
                    field="resultId"
                    categories={["equipment", "consumables", "materials"]}
                    selectedEntity={selectedEntity}
                    allEntities={allEntities}
                    currentLang={currentLang}
                    updateField={updateField}
                  />
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">
                      Result Quantity
                    </label>
                    <input
                      type="number"
                      className="w-full px-6 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl text-sm font-bold focus:ring-2 focus:ring-blue-500 transition-all"
                      value={(selectedEntity as Recipe).resultQuantity || 1}
                      onChange={(e) =>
                        updateField("resultQuantity", parseInt(e.target.value))
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <RelationSelect
                    label="Crafting Station (Optional)"
                    field="stationId"
                    categories={["locations", "npcs"]}
                    selectedEntity={selectedEntity}
                    allEntities={allEntities}
                    currentLang={currentLang}
                    updateField={updateField}
                  />
                </div>

                <IngredientsInput
                  entity={selectedEntity}
                  allEntities={allEntities}
                  currentLang={currentLang}
                  updateField={updateField}
                />
              </div>
            )}

            {/* Universal Connections */}
            <div className="pt-8 mt-8 border-t border-slate-100 dark:border-slate-800">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6 ml-4">
                Manual Connections (Arbitrary Links)
              </h4>
              <RelationSelect
                label="Related Entities"
                field="relatedIds"
                categories={[
                  "skills",
                  "equipment",
                  "consumables",
                  "materials",
                  "bestiary",
                  "locations",
                  "npcs",
                ]}
                multiple={true}
                selectedEntity={selectedEntity}
                allEntities={allEntities}
                currentLang={currentLang}
                updateField={updateField}
              />

              {/* Incoming Connections Display */}
              {allEntities.filter((e) =>
                e.relatedIds?.includes(selectedEntity.id),
              ).length > 0 && (
                <div className="mt-4 p-6 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <span className="text-[9px] font-black uppercase text-slate-400 block mb-3">
                    Incoming Connections (Linked from):
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {allEntities
                      .filter((e) => e.relatedIds?.includes(selectedEntity.id))
                      .map((e) => (
                        <span
                          key={e.id}
                          className="px-3 py-1.5 bg-white dark:bg-slate-800 rounded-lg text-[10px] font-bold border border-slate-100 dark:border-slate-700"
                        >
                          <span className="opacity-40 mr-1">
                            {e.category.toUpperCase()}
                          </span>
                          {e.name[currentLang] || e.name.ru}
                        </span>
                      ))}
                  </div>
                </div>
              )}

              <p className="text-[10px] text-slate-400 italic mt-4 ml-4">
                💡 Use this to link entities that don't have direct fields like
                'location' or 'drops' (e.g., link a hidden item to its
                location).
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="border-t border-slate-200 dark:border-slate-800 pt-12">
            <button
              onClick={() => {
                if (confirm("Permanently delete this entity?")) {
                  deleteEntity(selectedEntity.id);
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
  );
};
