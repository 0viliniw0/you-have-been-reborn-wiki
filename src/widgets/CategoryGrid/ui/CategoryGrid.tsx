import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const CATEGORY_ICONS: Record<string, string> = {
  skills: "🔥",
  equipment: "⚔️",
  consumables: "🧪",
  materials: "💎",
  bestiary: "🐲",
  locations: "🗺️",
  npcs: "👤",
  recipes: "🛠️",
};

const CATEGORIES = [
  "skills",
  "equipment",
  "consumables",
  "materials",
  "bestiary",
  "locations",
  "npcs",
  "recipes",
];

export const CategoryGrid = () => {
  const { t } = useTranslation();

  return (
    <section className="max-w-7xl mx-auto px-4 pb-32 w-full">
      <div className="flex items-center justify-between mb-12">
        <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">
          Explore Categories
        </h3>
        <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800 mx-8"></div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {CATEGORIES.map((cat, idx) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            key={cat}
          >
            <Link
              to={`/${cat}`}
              className="group relative p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm border border-slate-200 dark:border-slate-800 text-center hover:shadow-2xl hover:border-blue-500/50 hover:-translate-y-1 transition-all flex flex-col items-center"
            >
              <div className="absolute -top-4 -right-4 p-8 opacity-5 group-hover:opacity-10 transition-opacity grayscale group-hover:grayscale-0">
                <span className="text-9xl">{CATEGORY_ICONS[cat]}</span>
              </div>

              <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center text-4xl mb-6 group-hover:scale-110 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 transition-all duration-500 shadow-inner">
                {CATEGORY_ICONS[cat]}
              </div>

              <span className="text-xl font-black tracking-tight block mb-2 group-hover:text-blue-600 transition-colors">
                {t(`categories.${cat}`)}
              </span>

              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-widest font-black text-slate-400">
                  Browse
                </span>
                <span className="text-blue-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all">
                  →
                </span>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
