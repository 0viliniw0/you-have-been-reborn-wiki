import { motion } from "framer-motion";
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

interface CategoryHeaderProps {
  category?: string;
  count: number;
}

export const CategoryHeader = ({ category, count }: CategoryHeaderProps) => {
  const { t } = useTranslation();

  return (
    <header className="mb-16 relative">
      <div className="flex items-center gap-6">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-24 h-24 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-xl flex items-center justify-center text-5xl"
        >
          {category ? CATEGORY_ICONS[category] : "❓"}
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
            {count} Total Entities Found
          </p>
        </div>
      </div>
    </header>
  );
};
