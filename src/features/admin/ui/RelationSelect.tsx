import { Entity } from "../../../shared/types/entities";

interface RelationSelectProps {
  label: string;
  field: string;
  category: string;
  multiple?: boolean;
  selectedEntity: Entity | null;
  allEntities: Entity[];
  currentLang: "ru" | "en";
  updateField: (field: string, value: unknown) => void;
}

export const RelationSelect = ({
  label,
  field,
  category,
  multiple = false,
  selectedEntity,
  allEntities,
  currentLang,
  updateField,
}: RelationSelectProps) => {
  const value = selectedEntity
    ? (selectedEntity as Record<string, unknown>)[field]
    : undefined;
  const options = allEntities.filter((e) => e.category === category);

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
            const e = allEntities.find((x) => x.id === id);
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
                      selectedIds.filter((x: string) => x !== id)
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
