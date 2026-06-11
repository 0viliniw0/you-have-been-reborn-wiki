import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { loadAllEntities } from "../shared/api/dataService";
import { useTranslation } from "react-i18next";
import { EntityCard } from "../entities/Entity/ui/EntityCard";
import { motion } from "framer-motion";

const CATEGORY_ICONS: Record<string, string> = {
  skills: '🔥',
  equipment: '⚔️',
  consumables: '🧪',
  materials: '💎',
  bestiary: '🐲',
  locations: '🗺️',
  npcs: '👤',
  recipes: '🛠️',
};

export default function CategoryPage() {
  const { category } = useParams();
  const { t } = useTranslation();

  const { data: entities, isLoading } = useQuery({
    queryKey: ["entities", "all"],
    queryFn: loadAllEntities,
  });

  if (isLoading)
    return (
      <div className="flex flex-col items-center justify-center py-32">
         <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
         <p className="mt-4 font-black uppercase tracking-widest text-slate-400 animate-pulse">{t("common.loading")}</p>
      </div>
    );

  const filteredEntities =
    entities?.filter((e) => e.category === category) || [];

  return (
    <div className="flex flex-col">
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
        <nav className="mb-12 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em]">
          <Link
            to="/"
            className="text-slate-400 hover:text-blue-600 transition-colors"
          >
            {t("common.home")}
          </Link>
          <span className="text-slate-300 dark:text-slate-700">/</span>
          <span className="text-blue-600">
            {t(`categories.${category}`)}
          </span>
        </nav>

        <header className="mb-16 relative">
          <div className="flex items-center gap-6">
             <motion.div 
               initial={{ scale: 0.5, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               className="w-24 h-24 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-xl flex items-center justify-center text-5xl"
             >
                {category ? CATEGORY_ICONS[category] : '❓'}
             </motion.div>
             <div>
                <motion.h1 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-5xl md:text-7xl font-black tracking-tighter capitalize mb-2 italic"
                >
                  {t(`categories.${category}`)}
                </motion.h1>
                <p className="text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em] flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  {filteredEntities.length} Total Entities Found
                </p>
             </div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEntities.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <EntityCard entity={item} />
            </motion.div>
          ))}
          
          {filteredEntities.length === 0 && (
            <div className="col-span-full text-center py-32 bg-white dark:bg-slate-900 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
               <span className="text-6xl block mb-4">🔍</span>
               <h3 className="text-2xl font-black mb-2">{t("common.notFound")}</h3>
               <p className="text-slate-400 font-medium">Try checking another category or come back later.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
