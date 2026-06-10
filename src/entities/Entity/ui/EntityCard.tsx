import { Link } from 'react-router-dom';
import { Entity } from '../../../shared/types/entities';
import { useTranslation } from 'react-i18next';

interface EntityCardProps {
  entity: Entity;
  variant?: 'compact' | 'full';
}

const getRarityClass = (rarity?: string) => {
  switch (rarity) {
    case 'common': return 'bg-gray-100 text-gray-700';
    case 'uncommon': return 'bg-green-100 text-green-700';
    case 'rare': return 'bg-blue-100 text-blue-700';
    case 'epic': return 'bg-purple-100 text-purple-700';
    case 'legendary': return 'bg-orange-100 text-orange-700';
    case 'artifact': return 'bg-red-100 text-red-700 font-bold animate-pulse';
    default: return 'bg-gray-100 text-gray-500';
  }
};

export const EntityCard = ({ entity, variant = 'full' }: EntityCardProps) => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language.split('-')[0] as 'ru' | 'en';

  const rarity = (entity as any).rarity;
  const isBoss = (entity as any).isBoss;

  if (variant === 'compact') {
    return (
      <Link
        to={`/${entity.category}/${entity.slug}`}
        className="block p-4 hover:bg-gray-100 dark:hover:bg-gray-800 border-b border-gray-100 dark:border-gray-700 last:border-0 transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className="font-bold">{entity.name[currentLang] || entity.name['ru']}</div>
          {rarity && (
            <span className={`text-[10px] px-1.5 rounded uppercase font-bold ${getRarityClass(rarity)}`}>
              {rarity}
            </span>
          )}
        </div>
        <div className="text-sm text-gray-500">
          {t(`categories.${entity.category}`)}
        </div>
      </Link>
    );
  }

  return (
    <Link
      to={`/${entity.category}/${entity.slug}`}
      className="group p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all flex gap-4 relative overflow-hidden"
    >
      {entity.image && (
        <div className="w-20 h-20 rounded-lg bg-gray-50 dark:bg-gray-700 flex-shrink-0 overflow-hidden">
          <img 
            src={entity.image.startsWith('http') ? entity.image : `.${entity.image}`} 
            alt="" 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform"
          />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-xl font-bold truncate">
            {entity.name[currentLang] || entity.name['ru']}
          </h3>
          {rarity && (
            <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-black ${getRarityClass(rarity)}`}>
              {rarity}
            </span>
          )}
          {isBoss && (
            <span className="bg-red-600 text-white text-[10px] px-2 py-0.5 rounded uppercase font-black">
              BOSS
            </span>
          )}
        </div>
        <div className="text-xs text-blue-600 font-bold uppercase mb-2">
          {t(`categories.${entity.category}`)}
        </div>
        <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
          {entity.description[currentLang] || entity.description['ru']}
        </p>
      </div>
    </Link>
  );
};
