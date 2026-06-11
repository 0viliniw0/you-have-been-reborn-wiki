import { useState } from "react";
import { Entity } from "../../../shared/types/entities";

interface AdminSidebarProps {
  allEntities: Entity[];
  draftEntities: Entity[];
  deletedIds: string[];
  selectedEntityId: string | null;
  setSelectedEntityId: (id: string | null) => void;
  createNewEntity: () => void;
  handleSave: () => void;
  currentLang: "ru" | "en";
}

export const AdminSidebar = ({
  allEntities,
  draftEntities,
  deletedIds,
  selectedEntityId,
  setSelectedEntityId,
  createNewEntity,
  handleSave,
  currentLang,
}: AdminSidebarProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const categories = [
    "all",
    "skills",
    "equipment",
    "consumables",
    "materials",
    "bestiary",
    "locations",
    "npcs",
    "recipes",
  ];

  const filteredEntities = allEntities.filter((e) => {
    const matchesSearch =
      e.name[currentLang]?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.slug.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === "all" || e.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const totalChanges = draftEntities.length + deletedIds.length;

  return (
    <div className="w-80 flex-shrink-0 bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col h-full">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black tracking-tight italic">Library</h2>
          <button
            onClick={createNewEntity}
            className="w-8 h-8 flex items-center justify-center bg-blue-600 text-white rounded-lg shadow-lg shadow-blue-500/20 hover:scale-105 transition-transform"
          >
            +
          </button>
        </div>

        {/* Global Save Button */}
        {totalChanges > 0 && (
          <button
            onClick={handleSave}
            className="w-full py-3 bg-blue-600 text-white rounded-xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
          >
            <span>Push {totalChanges} Changes</span>
          </button>
        )}

        <div className="space-y-3">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">🔍</span>
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-blue-500/10"
            />
          </div>

          <div className="flex gap-1.5 overflow-x-auto pb-2 no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? "bg-blue-600 text-white"
                    : "bg-white dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-0.5">
        {filteredEntities.map((e) => {
          const isDraft = draftEntities.some((d) => d.id === e.id);
          const isDeleted = deletedIds.includes(e.id);
          const isActive = selectedEntityId === e.id;
          
          return (
            <button
              key={e.id}
              onClick={() => setSelectedEntityId(e.id)}
              className={`w-full p-2 rounded-lg text-left transition-all border flex items-center gap-3 group relative ${
                isActive
                  ? "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm"
                  : "bg-transparent border-transparent hover:bg-slate-100 dark:hover:bg-slate-800/50"
              }`}
            >
              {/* Active Indicator */}
              {isActive && (
                <div className="absolute left-0 top-2 bottom-2 w-1 bg-blue-600 rounded-r-full" />
              )}

              <div
                className={`w-9 h-9 rounded-md flex-shrink-0 flex items-center justify-center text-lg shadow-inner overflow-hidden ${
                  isActive ? "bg-slate-50 dark:bg-slate-900" : "bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700"
                }`}
              >
                {e.image ? (
                  <img
                    src={e.image.startsWith("http") ? e.image : `.${e.image}`}
                    className="w-full h-full object-contain p-1"
                    alt=""
                  />
                ) : (
                  <span className="opacity-20 text-[10px]">📦</span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div
                    className={`font-bold text-[11px] truncate ${
                      isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-700 dark:text-slate-200"
                    }`}
                  >
                    {e.name[currentLang] || e.name.ru}
                  </div>
                  {isDraft && (
                    <div className="w-1.5 h-1.5 bg-amber-500 rounded-full flex-shrink-0" title="Unsaved changes" />
                  )}
                  {isDeleted && (
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full flex-shrink-0" title="Marked for deletion" />
                  )}
                </div>
                <div className="text-[8px] uppercase font-black tracking-widest text-slate-400 mt-0.5">
                  {e.category.slice(0, 10)}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
