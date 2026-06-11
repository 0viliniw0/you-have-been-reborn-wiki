import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "../../../shared/ui/LanguageSwitcher";
import { motion } from "framer-motion";

export const Header = () => {
  const { t } = useTranslation();

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 transition-all">
      <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between gap-8">
        <Link to="/" className="flex items-center gap-4 group flex-shrink-0">
          <motion.div
            whileHover={{ rotate: 15, scale: 1.1 }}
            className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-500/20"
          >
            <span className="text-2xl font-black italic">R</span>
          </motion.div>
          <div>
            <h1 className="text-2xl font-black tracking-tighter leading-none group-hover:text-blue-600 transition-colors">
              {t("header.title")}
            </h1>
            <p className="text-[10px] uppercase tracking-[0.3em] font-black text-slate-400">
              {t("header.subtitle")}
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-4">
          <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 mx-2 hidden sm:block"></div>
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
};
