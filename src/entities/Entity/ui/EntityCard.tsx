import { Link } from 'react-router-dom';
import { Entity } from '../../../shared/types/entities';
import { useTranslation } from 'react-i18next';

interface EntityCardProps {
  entity: Entity;
  variant?: 'compact' | 'full';
}

export const EntityCard = ({ entity, variant = 'full' }: EntityCardProps) => {
  const { i18n } = useTranslation();
  const currentLang = i18n.language.split('-')[0] as 'ru' | 'en';

  if (variant === 'compact') {
    return (
      <Link
        to={`/${entity.category}/${entity.slug}`}
        className="block p-4 hover:bg-gray-100 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-0 transition-colors"
      >
        <div className="font-bold">{entity.name[currentLang] || entity.name['ru']}</div>
        <div className="text-sm text-gray-500">
          {entity.category} • {entity.tags.join(', ')}
        </div>
      </Link>
    );
  }

  return (
    <Link
      to={`/${entity.category}/${entity.slug}`}
      className="group p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all flex gap-4"
    >
      {entity.image && (
        <div className="w-16 h-16 rounded-lg bg-gray-50 dark:bg-gray-700 flex-shrink-0 overflow-hidden">
          <img 
            src={entity.image.startsWith('http') ? entity.image : `.${entity.image}`} 
            alt="" 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform"
          />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <h3 className="text-xl font-bold mb-1 truncate">
          {entity.name[currentLang] || entity.name['ru']}
        </h3>
        <p className="text-sm text-gray-500 line-clamp-2">
          {entity.description[currentLang] || entity.description['ru']}
        </p>
      </div>
    </Link>
  );
};
