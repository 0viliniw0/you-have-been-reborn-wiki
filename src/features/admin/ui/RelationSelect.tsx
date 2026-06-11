import { Entity, EntityCategory } from "../../../shared/types/entities";

interface RelationSelectProps {
  label: string;
  field: string;
  categories: EntityCategory[];
  multiple?: boolean;
  selectedEntity: Entity | null;
  allEntities: Entity[];
  currentLang: "ru" | "en";
  updateField: (field: string, value: unknown) => void;
}

export const RelationSelect = ({
  label,
  field,
  categories,
  multiple = false,
  selectedEntity,
  allEntities,
  currentLang,
  updateField,
}: RelationSelectProps) => {
  const value = selectedEntity
    ? (selectedEntity as Record<string, unknown>)[field]
    : undefined;
    
  const options = allEntities.filter((e) => categories.includes(e.category));

  if (multiple) {
    const selectedIds = (value as string[]) || [];
    return (
      <div className="space-y-2">
        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 ml-1">
          {label}
        </label>
        <div className="p-3 bg-slate-50/50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800/50 min-h-[44px] flex flex-wrap gap-1.5">
          {selectedIds.length === 0 && (
            <span className="text-[10px] text-slate-400 italic py-1 px-2">None linked...</span>
          )}
          {selectedIds.map((id: string) => {
            const e = allEntities.find((x) => x.id === id);
            return (
              <span
                key={id}
                className="bg-white dark:bg-slate-800 pl-2 pr-1 py-1 rounded-lg text-[10px] font-bold border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 shadow-sm"
              >
                <span className="opacity-40 text-[8px]">{e?.category.slice(0,3).toUpperCase()}</span>
                <span className="truncate max-w-[120px]">{e?.name[currentLang] || id}</span>
                <button
                  onClick={() => updateField(field, selectedIds.filter((x) => x !== id))}
                  className="w-4 h-4 flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-900/30 text-slate-400 hover:text-red-500 rounded transition-colors"
                >
                  ✕
                </button>
              </span>
            );
          })}
        </div>
        <select
          className="w-full h-10 px-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-blue-500/10 transition-all appearance-none cursor-pointer"
          onChange={(e) => {
            if (e.target.value && !selectedIds.includes(e.target.value)) {
              updateField(field, [...selectedIds, e.target.value]);
            }
          }}
          value=""
        >
          <option value="">+ Link {label.toLowerCase()}...</option>
          {options.map((o) => (
            <option key={o.id} value={o.id}>
              [{o.category.toUpperCase()}] {o.name[currentLang] || o.name["ru"]}
            </option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 ml-1">
        {label}
      </label>
      <select
        className="w-full h-10 px-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500/10 transition-all appearance-none cursor-pointer"
        value={(value as string) || ""}
        onChange={(e) => updateField(field, e.target.value)}
      >
        <option value="">Select {label.toLowerCase()}...</option>
        {options.map((o) => (
          <option key={o.id} value={o.id}>
             [{o.category.toUpperCase()}] {o.name[currentLang] || o.name["ru"]}
          </option>
        ))}
      </select>
    </div>
  );
};
