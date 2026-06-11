import { motion } from "framer-motion";
import {
  Entity,
  Bestiary,
  Recipe,
  Equipment,
} from "../../../shared/types/entities";
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
  const categories = [
    "skills", "equipment", "consumables", "materials", 
    "bestiary", "locations", "npcs", "recipes"
  ];

  return (
    <motion.div
      key={selectedEntity.id}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex-1 overflow-y-auto bg-white dark:bg-slate-950"
    >
      <div className="max-w-3xl mx-auto py-8 px-6 space-y-10">
        {/* Compact Header */}
        <header className="flex justify-between items-center pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
               <span className="px-1.5 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 text-[8px] font-black uppercase tracking-widest rounded-md">
                 {selectedEntity.category}
               </span>
               <span className="text-[10px] font-mono text-slate-400">#{selectedEntity.id.slice(0, 8)}</span>
            </div>
            <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              {selectedEntity.name[currentLang] || selectedEntity.name.ru}
            </h2>
          </div>
          <button
            onClick={() => confirm("Delete this entity?") && deleteEntity(selectedEntity.id)}
            className="p-2 text-slate-300 hover:text-red-500 transition-colors"
          >
            <span className="text-sm">🗑️</span>
          </button>
        </header>

        {/* 1. Visuals & Core Identity */}
        <section className="grid grid-cols-1 md:grid-cols-[120px_1fr] gap-8">
          <div className="relative group w-[120px] h-[120px] bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-center overflow-hidden">
            {selectedEntity.image ? (
              <img
                src={selectedEntity.image.startsWith("http") ? selectedEntity.image : `.${selectedEntity.image}`}
                className="w-full h-full object-contain p-2"
                alt=""
              />
            ) : (
              <span className="text-2xl grayscale opacity-20">🖼️</span>
            )}
            <label className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
               <span className="text-white text-[10px] font-bold uppercase tracking-wider">Upload</span>
               <input type="file" className="hidden" onChange={uploadImage} accept="image/*" />
            </label>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="col-span-2 space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 ml-1">Category</label>
                <select
                  className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-900 border border-transparent rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500/10 appearance-none"
                  value={selectedEntity.category}
                  onChange={(e) => updateField("category", e.target.value)}
                >
                  {categories.map(c => <option key={c} value={c}>{c.toUpperCase()}</option>)}
                </select>
             </div>
             <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 ml-1">Slug (URL)</label>
                <input
                  className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-900 border border-transparent rounded-xl text-xs font-mono outline-none focus:ring-2 focus:ring-blue-500/10"
                  value={selectedEntity.slug}
                  onChange={(e) => updateField("slug", e.target.value)}
                />
             </div>
             <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 ml-1">Image Path</label>
                <input
                  className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-900 border border-transparent rounded-xl text-xs font-mono outline-none focus:ring-2 focus:ring-blue-500/10"
                  value={selectedEntity.image || ""}
                  onChange={(e) => updateField("image", e.target.value)}
                  placeholder="/images/..."
                />
             </div>
          </div>
        </section>

        {/* 2. Names & Content */}
        <section className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 ml-1">Name (RU)</label>
              <input
                className="w-full h-10 px-3 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500/10"
                value={selectedEntity.name.ru}
                onChange={(e) => updateLocalizedField("name", "ru", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 ml-1">Name (EN)</label>
              <input
                className="w-full h-10 px-3 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500/10"
                value={selectedEntity.name.en}
                onChange={(e) => updateLocalizedField("name", "en", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 ml-1">Description (RU)</label>
              <textarea
                className="w-full p-4 border border-slate-200 dark:border-slate-800 rounded-xl text-xs leading-relaxed h-32 outline-none focus:ring-2 focus:ring-blue-500/10 resize-none"
                value={selectedEntity.description.ru}
                onChange={(e) => updateLocalizedField("description", "ru", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 ml-1">Description (EN)</label>
              <textarea
                className="w-full p-4 border border-slate-200 dark:border-slate-800 rounded-xl text-xs leading-relaxed h-32 outline-none focus:ring-2 focus:ring-blue-500/10 resize-none"
                value={selectedEntity.description.en}
                onChange={(e) => updateLocalizedField("description", "en", e.target.value)}
              />
            </div>
          </div>
        </section>

        {/* 3. Logic & Connections */}
        <section className="space-y-8 pt-8 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-4 mb-2">
             <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">Properties</h3>
             <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800"></div>
          </div>

          <div className="space-y-6">
            {selectedEntity.category === "equipment" && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 ml-1">Type</label>
                  <select
                    className="w-full h-10 px-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold"
                    value={(selectedEntity as Equipment).type}
                    onChange={(e) => updateField("type", e.target.value)}
                  >
                    <option value="weapon">Weapon</option>
                    <option value="armor">Armor</option>
                    <option value="accessory">Accessory</option>
                  </select>
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
              </div>
            )}

            {selectedEntity.category === "bestiary" && (
              <div className="space-y-6">
                <div className="w-1/2 space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 ml-1">Behavior</label>
                  <select
                    className="w-full h-10 px-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold"
                    value={(selectedEntity as Bestiary).behavior}
                    onChange={(e) => updateField("behavior", e.target.value)}
                  >
                    <option value="aggressive">Aggressive</option>
                    <option value="boss">Boss</option>
                    <option value="passive">Passive</option>
                    <option value="peaceful">Peaceful</option>
                  </select>
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
                
                <div className="space-y-3">
                   <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 ml-1">Loot Table</label>
                   <div className="grid grid-cols-1 gap-2">
                    {((selectedEntity as Bestiary).drops || []).map((drop, idx) => (
                        <div key={idx} className="flex gap-2 items-center bg-slate-50 dark:bg-slate-900/50 p-2 rounded-xl border border-slate-100 dark:border-slate-800/50">
                          <select
                            className="flex-1 h-9 px-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-[10px] font-medium"
                            value={drop.id}
                            onChange={(e) => {
                              const next = [...((selectedEntity as Bestiary).drops || [])];
                              next[idx] = { ...next[idx], id: e.target.value };
                              updateField("drops", next);
                            }}
                          >
                            <option value="">Select drop...</option>
                            {allEntities.filter(x => ["equipment", "consumables", "materials"].includes(x.category)).map(x => (
                                <option key={x.id} value={x.id}>[{x.category[0].toUpperCase()}] {x.name[currentLang]}</option>
                            ))}
                          </select>
                          <div className="flex items-center gap-1.5 px-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg h-9">
                            <input
                              type="number"
                              className="w-8 text-center text-[10px] font-black outline-none bg-transparent"
                              value={drop.chance}
                              onChange={(e) => {
                                const next = [...((selectedEntity as Bestiary).drops || [])];
                                next[idx] = { ...next[idx], chance: Number(e.target.value) };
                                updateField("drops", next);
                              }}
                            />
                            <span className="text-[8px] font-bold text-slate-400">%</span>
                          </div>
                          <button
                            onClick={() => updateField("drops", ((selectedEntity as Bestiary).drops || []).filter((_, i) => i !== idx))}
                            className="w-7 h-7 flex items-center justify-center text-slate-300 hover:text-red-500"
                          >✕</button>
                        </div>
                    ))}
                   </div>
                   <button
                     onClick={() => updateField("drops", [...((selectedEntity as Bestiary).drops || []), { id: "", chance: 10 }])}
                     className="text-[9px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-700 ml-1"
                   >+ Add Item</button>
                </div>
              </div>
            )}

            {selectedEntity.category === "npcs" && (
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
            )}

            {selectedEntity.category === "recipes" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-6">
                    <RelationSelect
                      label="Resulting Item"
                      field="resultId"
                      categories={["equipment", "consumables", "materials"]}
                      selectedEntity={selectedEntity}
                      allEntities={allEntities}
                      currentLang={currentLang}
                      updateField={updateField}
                    />
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 ml-1">Quantity</label>
                      <input
                        type="number"
                        className="w-full h-10 px-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold"
                        value={(selectedEntity as Recipe).resultQuantity || 1}
                        onChange={(e) => updateField("resultQuantity", parseInt(e.target.value))}
                      />
                    </div>
                 </div>
                 <IngredientsInput
                    entity={selectedEntity}
                    allEntities={allEntities}
                    currentLang={currentLang}
                    updateField={updateField}
                  />
              </div>
            )}

            {/* Manual Connections */}
            <div className="pt-6 space-y-4">
              <RelationSelect
                label="Manual Connections (Arbitrary Links)"
                field="relatedIds"
                categories={["skills", "equipment", "consumables", "materials", "bestiary", "locations", "npcs"]}
                multiple={true}
                selectedEntity={selectedEntity}
                allEntities={allEntities}
                currentLang={currentLang}
                updateField={updateField}
              />

              {/* Incoming Connections Display */}
              {allEntities.filter((e) => e.relatedIds?.includes(selectedEntity.id)).length > 0 && (
                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800">
                  <span className="text-[8px] font-black uppercase text-slate-400 block mb-2 tracking-widest">
                    Incoming Connections:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {allEntities
                      .filter((e) => e.relatedIds?.includes(selectedEntity.id))
                      .map((e) => (
                        <span key={e.id} className="px-2 py-1 bg-white dark:bg-slate-800 rounded-md text-[9px] font-bold border border-slate-100 dark:border-slate-700 text-slate-500">
                          {e.name[currentLang] || e.name.ru}
                        </span>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </motion.div>
  );
};
