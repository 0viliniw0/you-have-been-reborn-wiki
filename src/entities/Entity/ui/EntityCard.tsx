import { Link } from 'react-router-dom';
import { Entity } from '../../../shared/types/entities';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

interface EntityCardProps {
  entity: Entity;
  variant?: 'compact' | 'full';
}

const getRarityColors = (rarity?: string) => {
  switch (rarity) {
    case 'common': return 'from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 border-slate-200 dark:border-slate-800 text-slate-500';
    case 'uncommon': return 'from-emerald-50 to-emerald-100 dark:from-emerald-950/30 dark:to-emerald-900/20 border-emerald-200/50 dark:border-emerald-800/50 text-emerald-600';
    case 'rare': return 'from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20 border-blue-200/50 dark:border-blue-800/50 text-blue-600';
    case 'epic': return 'from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/20 border-purple-200/50 dark:border-purple-800/50 text-purple-600 shadow-purple-500/5';
    case 'legendary': return 'from-amber-50 to-orange-100 dark:from-orange-950/30 dark:to-orange-900/20 border-orange-200/50 dark:border-orange-800/50 text-orange-600 shadow-orange-500/10';
    case 'artifact': return 'from-red-50 to-red-100 dark:from-red-950/30 dark:to-red-900/20 border-red-200/50 dark:border-red-800/50 text-red-600 shadow-red-500/20 ring-1 ring-red-500/20';
    default: return 'from-slate-50 to-slate-100 dark:from-slate-900/50 dark:to-slate-800/50 border-slate-200 dark:border-slate-800 text-slate-500';
  }
};

export const EntityCard = ({ entity, variant = 'full' }: EntityCardProps) => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language.split('-')[0] as 'ru' | 'en';

  const rarity = 'rarity' in entity && entity.category !== 'materials' ? (entity as { rarity?: string }).rarity : undefined;
  const isBoss = 'isBoss' in entity ? (entity as { isBoss?: boolean }).isBoss : false;
  const rarityClasses = getRarityColors(rarity);
  const isHighRarity = rarity === 'legendary' || rarity === 'artifact';

  const stripMarkdown = (text: string) => {
    return text.replace(/[#*`_>]/g, '').replace(/\[(.*?)\]\(.*?\)/g, '$1').trim();
  };

  if (variant === 'compact') {
    return (
      <Link to={`/${entity.category}/${entity.slug}`} className="block">
        <motion.div 
          whileHover={{ x: 5 }}
          className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 flex items-center justify-between transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full bg-gradient-to-br ${rarityClasses.split(' ').slice(0,2).join(' ')}`}></div>
            <span className="font-bold text-sm">{entity.name[currentLang] || entity.name['ru']}</span>
          </div>
          <span className="text-[10px] uppercase font-black text-slate-400">
            {t(`categories.${entity.category}`)}
          </span>
        </motion.div>
      </Link>
    );
  }

  return (
    <Link to={`/${entity.category}/${entity.slug}`} className="block h-full group">
      <motion.div 
        whileHover={{ y: -5 }}
        className={`h-full p-1 rounded-[2rem] bg-gradient-to-br ${rarityClasses.split(' ').slice(0,2).join(' ')} border ${rarityClasses.split(' ').find(c => c.startsWith('border-'))} transition-all shadow-sm hover:shadow-2xl relative overflow-hidden`}
      >
        {isHighRarity && (
          <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
        )}
        <div className="bg-white dark:bg-slate-950 h-full rounded-[1.8rem] p-6 flex flex-col relative z-10">
          <div className="flex items-start justify-between mb-6">
            <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-slate-900 flex-shrink-0 overflow-hidden border border-slate-100 dark:border-slate-800 group-hover:border-blue-500/30 transition-colors">
              {entity.image ? (
                <img 
                  src={entity.image.startsWith('http') ? entity.image : `.${entity.image}`} 
                  alt="" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl grayscale opacity-20">🖼️</div>
              )}
            </div>
            {isBoss && (
              <span className="bg-red-600 text-white text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-tighter shadow-lg shadow-red-500/20">
                BOSS
              </span>
            )}
          </div>

          <div className="flex-1">
             <div className="flex items-center gap-2 mb-1">
               <h3 className="text-xl font-black tracking-tight leading-none group-hover:text-blue-600 transition-colors">
                 {entity.name[currentLang] || entity.name['ru']}
               </h3>
             </div>
             <div className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-3">
               {t(`categories.${entity.category}`)}
             </div>
             <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed font-medium">
               {stripMarkdown(entity.description[currentLang] || entity.description['ru'])}
             </p>
          </div>

          {rarity && (
            <div className="mt-6 pt-4 border-t border-slate-50 dark:border-slate-900 flex items-center justify-between">
              <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${rarityClasses.split(' ').find(c => c.startsWith('text-'))}`}>
                {rarity}
              </span>
              <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">
                →
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </Link>
  );
};
