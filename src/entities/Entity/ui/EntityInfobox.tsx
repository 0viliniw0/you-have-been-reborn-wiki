import { motion } from "framer-motion";
import { Entity } from "../../../shared/types/entities";

interface EntityInfoboxProps {
  entity: Entity;
}

export const EntityInfobox = ({ entity }: EntityInfoboxProps) => {
  const behavior = entity.category === "bestiary" ? entity.behavior : null;

  return (
    <aside className="lg:col-span-4 sticky top-24">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden"
      >
        {/* Entity Image */}
        <div className="aspect-square bg-slate-50 dark:bg-slate-800/50 p-8 flex items-center justify-center relative group">
          {entity.image ? (
            <img
              src={
                entity.image.startsWith("http")
                  ? entity.image
                  : `.${entity.image}`
              }
              alt=""
              className="w-full h-full object-contain drop-shadow-2xl group-hover:scale-110 transition-transform duration-700"
            />
          ) : (
            <span className="text-9xl grayscale opacity-10">🖼️</span>
          )}
        </div>

        {/* Infobox Stats */}
        <div className="p-8 space-y-8 relative overflow-hidden">
          {/* Background Decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

          <div className="grid grid-cols-1 gap-6 relative z-10">
            {behavior && (
              <div className="flex justify-between items-center group/item">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-xs shadow-inner">
                    🧠
                  </span>
                  <span className="text-[10px] uppercase font-black text-slate-500 tracking-wider">
                    Behavior
                  </span>
                </div>
                <span
                  className={`font-black capitalize px-3 py-1 rounded-lg text-xs border ${
                    behavior === "boss"
                      ? "bg-red-50 dark:bg-red-900/20 text-red-600 border-red-100 dark:border-red-800/50"
                      : behavior === "peaceful"
                        ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 border-emerald-100 dark:border-emerald-800/50"
                        : "bg-amber-50 dark:bg-amber-900/20 text-amber-600 border-amber-100 dark:border-amber-800/50"
                  }`}
                >
                  {behavior}
                </span>
              </div>
            )}

            {"stats" in entity &&
              entity.stats &&
              Object.entries(entity.stats).map(([key, value]) => (
                <div
                  key={key}
                  className="flex justify-between items-center group/item"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-xs shadow-inner">
                      ⚡
                    </span>
                    <span className="text-[10px] uppercase font-black text-slate-500 tracking-wider">
                      {key.replace("_", " ")}
                    </span>
                  </div>
                  <span className="font-black text-blue-600 text-sm">
                    +{value}
                  </span>
                </div>
              ))}
          </div>
        </div>

        <div className="p-8 bg-slate-50 dark:bg-slate-800/30 text-center">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Updated: {new Date(entity.updatedAt).toLocaleDateString()}
          </span>
        </div>
      </motion.div>
    </aside>
  );
};
