import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '../../../shared/ui/LanguageSwitcher';
import { ThemeSwitcher } from '../../../shared/ui/ThemeSwitcher';
import { Search } from '../../../features/search/ui/Search';
import { motion } from 'framer-motion';

const CATEGORIES = [
  'skills', 'equipment', 'consumables', 'materials', 'bestiary', 'locations', 'npcs', 'quests'
];

export const Header = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 transition-all">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-3 group flex-shrink-0">
          <motion.div 
            whileHover={{ rotate: 15 }}
            className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20"
          >
            <span className="text-xl font-black">R</span>
          </motion.div>
          <div className="hidden lg:block">
            <h1 className="text-xl font-black tracking-tight leading-none group-hover:text-blue-600 transition-colors">
              {t('header.title')}
            </h1>
            <p className="text-[10px] uppercase tracking-widest font-black text-slate-400">
              {t('header.subtitle')}
            </p>
          </div>
        </Link>

        <nav className="hidden xl:flex items-center gap-6">
          {CATEGORIES.slice(0, 4).map(cat => (
            <Link 
              key={cat} 
              to={`/${cat}`} 
              className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-blue-600 transition-colors"
            >
              {t(`categories.${cat}`)}
            </Link>
          ))}
        </nav>

        <div className="flex-1 flex justify-center">
          {!isHome && <Search variant="compact" />}
        </div>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeSwitcher />
        </div>
      </div>
    </header>
  );
};
