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
          const item = allEntities.find((e) => e.id === ing.id);
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
          {allEntities
            .filter((e) =>
              ["materials", "equipment", "consumables"].includes(e.category)
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
