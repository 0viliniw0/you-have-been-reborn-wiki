import { useState } from "react";
import { Entity, Recipe } from "../../../shared/types/entities";

interface IngredientsInputProps {
  entity: Entity;
  allEntities: Entity[];
  currentLang: "ru" | "en";
  updateField: (field: string, value: unknown) => void;
}

export const IngredientsInput = ({
  entity,
  allEntities,
  currentLang,
  updateField,
}: IngredientsInputProps) => {
  const recipe = entity as Recipe;
  const ingredients = recipe.ingredients || [];
  const [selectedId, setSelectedId] = useState("");
  const [quantity, setQuantity] = useState(1);

  const addIngredient = () => {
    if (!selectedId) return;
    if (ingredients.find((i) => i.id === selectedId)) return;
    updateField("ingredients", [...ingredients, { id: selectedId, quantity }]);
    setSelectedId("");
    setQuantity(1);
  };

  const removeIngredient = (id: string) => {
    updateField(
      "ingredients",
      ingredients.filter((i) => i.id !== id)
    );
  };

  return (
    <div className="space-y-4">
      <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 ml-1">
        Recipe Ingredients
      </h4>
      
      <div className="space-y-1">
        {ingredients.length === 0 && (
          <div className="py-6 text-center bg-slate-50/50 dark:bg-slate-950/20 rounded-xl border-2 border-dashed border-slate-100 dark:border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            No ingredients
          </div>
        )}
        {ingredients.map((ing) => {
          const item = allEntities.find((e) => e.id === ing.id);
          return (
            <div
              key={ing.id}
              className="flex items-center gap-3 p-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl shadow-sm group"
            >
              <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center p-1.5 flex-shrink-0">
                {item?.image ? (
                  <img
                    src={item.image.startsWith("http") ? item.image : `.${item.image}`}
                    className="w-full h-full object-contain"
                    alt=""
                  />
                ) : (
                  <span className="text-[10px]">📦</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-black truncate leading-tight">
                  {item?.name[currentLang] || item?.name["ru"] || ing.id}
                </div>
                <div className="text-[9px] text-blue-600 font-bold uppercase tracking-tight">
                  Qty: {ing.quantity}
                </div>
              </div>
              <button
                onClick={() => removeIngredient(ing.id)}
                className="w-7 h-7 flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-all"
              >
                ✕
              </button>
            </div>
          );
        })}
      </div>

      <div className="flex gap-2">
        <select
          className="flex-1 h-10 px-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium outline-none"
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
        >
          <option value="">Select item...</option>
          {allEntities
            .filter((e) => ["materials", "equipment", "consumables"].includes(e.category))
            .map((e) => (
              <option key={e.id} value={e.id}>
                [{e.category.toUpperCase()}] {e.name[currentLang] || e.name["ru"]}
              </option>
            ))}
        </select>
        <input
          type="number"
          className="w-16 h-10 px-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-black text-center"
          value={quantity}
          onChange={(e) => setQuantity(parseInt(e.target.value))}
        />
        <button
          onClick={addIngredient}
          className="px-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold text-[10px] uppercase tracking-wider"
        >
          Add
        </button>
      </div>
    </div>
  );
};
