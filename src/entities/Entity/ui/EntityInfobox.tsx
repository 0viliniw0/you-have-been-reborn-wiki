import { motion } from "framer-motion";
import { Entity, Bestiary, Equipment } from "../../../shared/types/entities";

interface EntityInfoboxProps {
  entity: Entity;
}

export const EntityInfobox = ({ entity }: EntityInfoboxProps) => {
  const behavior = entity.category === "bestiary" ? (entity as Bestiary).behavior : null;
  const type = entity.category === "equipment" ? (entity as Equipment).type : null;

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

        {/* Quick Info */}
        {(behavior || type) && (
          <div className="px-8 py-6 border-t border-slate-100 dark:border-slate-800">
            <div className="flex justify-between items-center">
               <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                 {behavior ? 'Behavior' : 'Type'}
               </span>
               <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${
                 behavior === 'boss' ? 'bg-red-50 text-red-600 border-red-100' :
                 behavior === 'aggressive' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                 'bg-blue-50 text-blue-600 border-blue-100'
               }`}>
                 {behavior || type}
               </span>
            </div>
          </div>
        )}

        <div className="p-8 bg-slate-50 dark:bg-slate-800/30 text-center">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            {entity.category.toUpperCase()} Entity
          </span>
        </div>
      </motion.div>
    </aside>
  );
};
