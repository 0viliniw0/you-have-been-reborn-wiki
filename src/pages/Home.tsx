import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search } from '../features/search/ui/Search';

const CATEGORY_ICONS: Record<string, string> = {
  skills: '🔥',
  equipment: '⚔️',
  consumables: '🧪',
  materials: '💎',
  bestiary: '🐲',
  locations: '🗺️',
  npcs: '👤',
  quests: '📜',
};

const CATEGORIES = [
  'skills', 'equipment', 'consumables', 'materials', 'bestiary', 'locations', 'npcs', 'quests'
];

export default function Home() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative py-24 px-4 overflow-hidden">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl md:text-8xl font-black tracking-tight mb-8 leading-none"
          >
            Explore the <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              Reborn
            </span> Universe
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto mb-16 font-medium"
          >
            The definitive community-driven database for items, creatures, and lore. 
            Completely static, blazing fast, and always up to date.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Search variant="hero" />
          </motion.div>
        </div>

        {/* Background Decoration */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none -z-0">
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/10 rounded-full blur-[120px]"></div>
           <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-indigo-500/5 rounded-full blur-[80px]"></div>
        </div>
      </section>

      {/* Categories Grid */}
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
                className="group relative p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm border border-slate-200 dark:border-slate-800 text-center hover:shadow-2xl hover:border-blue-500/50 hover:-translate-y-1 transition-all flex flex-col items-center overflow-hidden"
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
                   <span className="text-blue-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all">→</span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>
      
      {import.meta.env.DEV && (
        <section className="max-w-7xl mx-auto px-4 mb-20 w-full">
           <Link to="/admin" className="block p-12 bg-slate-900 dark:bg-white rounded-[3rem] text-center group overflow-hidden relative">
              <div className="absolute inset-0 bg-blue-600 opacity-0 group-hover:opacity-10 transition-opacity"></div>
              <h4 className="text-white dark:text-slate-900 text-2xl font-black mb-2 relative z-10">Access Content Editor</h4>
              <p className="text-slate-400 dark:text-slate-500 font-medium relative z-10">Contribute to the wiki and manage data directly from your browser.</p>
           </Link>
        </section>
      )}
    </div>
  );
}
