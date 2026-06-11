import { useState } from "react";
import { Entity } from "../../../shared/types/entities";
import { LanguageSwitcher } from "../../../shared/ui/LanguageSwitcher";

interface AdminSidebarProps {
  allEntities: Entity[];
  draftEntities: Entity[];
  selectedEntityId: string | null;
  setSelectedEntityId: (id: string | null) => void;
  createNewEntity: () => void;
  currentLang: "ru" | "en";
}

export const AdminSidebar = ({
  allEntities,
  draftEntities,
  selectedEntityId,
  setSelectedEntityId,
  createNewEntity,
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

  return (
    <div className="w-96 flex-shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col h-full">
      <div className="p-8 border-b border-slate-200 dark:border-slate-800">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-black tracking-tighter italic">Library</h2>
          <button
            onClick={createNewEntity}
            className="bg-blue-600 text-white px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:scale-105 transition-transform"
          >
            + Create New
          </button>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
            <input
              type="text"
              placeholder="Search entities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-blue-500/20 outline-none"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide no-scrollbar">
            {categories.map((cat) => (
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
        {filteredEntities.map((e) => {
          const isDraft = draftEntities.some((d) => d.id === e.id);
          const isActive = selectedEntityId === e.id;
          return (
            <button
              key={e.id}
              onClick={() => setSelectedEntityId(e.id)}
              className={`w-full p-5 rounded-[1.8rem] text-left transition-all border group relative ${
                isActive
                  ? "bg-blue-600 border-blue-500 shadow-2xl shadow-blue-500/20 translate-x-1"
                  : "bg-transparent border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/50"
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-12 h-12 rounded-2xl flex-shrink-0 flex items-center justify-center text-xl shadow-inner ${
                    isActive ? "bg-blue-500" : "bg-slate-100 dark:bg-slate-800"
                  }`}
                >
                  {e.image ? (
                    <img
                      src={e.image.startsWith("http") ? e.image : `.${e.image}`}
                      className="w-full h-full object-cover rounded-2xl"
                      alt=""
                    />
                  ) : (
                    <span className="opacity-30">🖼️</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div
                    className={`font-black text-sm mb-1 truncate ${
                      isActive ? "text-white" : "text-slate-900 dark:text-slate-100"
                    }`}
                  >
                    {e.name[currentLang] || e.name.ru}
                  </div>
                  <div className="flex items-center justify-between">
                    <div
                      className={`text-[9px] uppercase font-black tracking-widest ${
                        isActive ? "text-blue-200" : "text-slate-400"
                      }`}
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
    </div>
  );
};
