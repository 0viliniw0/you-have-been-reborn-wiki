import { useState } from "react";
import { Entity } from "../../../shared/types/entities";

interface ObjectMapInputProps {
  label: string;
  field: string;
  entity: Entity;
  updateField: (field: string, value: unknown) => void;
}

export const ObjectMapInput = ({
  label,
  field,
  entity,
  updateField,
}: ObjectMapInputProps) => {
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
