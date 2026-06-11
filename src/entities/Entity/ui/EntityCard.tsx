import { Link } from 'react-router-dom';
import { Entity } from '../../../shared/types/entities';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

interface EntityCardProps {
  entity: Entity;
  variant?: 'compact' | 'full';
}

export const EntityCard = ({ entity, variant = 'full' }: EntityCardProps) => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language.split('-')[0] as 'ru' | 'en';

  const behavior = entity.category === 'bestiary' ? entity.behavior : null;

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
            <span className="font-bold text-sm">{entity.name[currentLang] || entity.name['ru']}</span>
            {behavior && (
              <span className={`text-[8px] px-1.5 py-0.5 rounded-md font-black uppercase tracking-tighter ${
                behavior === 'boss' ? 'bg-red-600 text-white animate-pulse' :
                behavior === 'peaceful' ? 'bg-emerald-500 text-white' :
                'bg-amber-500 text-white'
              }`}>
                {behavior}
              </span>
            )}
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
        className={`h-full p-1 rounded-[2rem] bg-gradient-to-br border transition-all shadow-sm hover:shadow-2xl relative overflow-hidden`}
      >
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
            {behavior && (
              <span className={`text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-tighter shadow-lg ${
                behavior === 'boss' ? 'bg-red-600 text-white shadow-red-500/20 animate-pulse' :
                behavior === 'peaceful' ? 'bg-emerald-500 text-white shadow-emerald-500/20' :
                'bg-amber-500 text-white shadow-amber-500/20'
              }`}>
                {behavior}
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
        </div>
      </motion.div>
    </Link>
  );
};
