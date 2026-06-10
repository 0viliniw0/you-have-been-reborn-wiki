import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { loadAllEntities } from '../shared/api/dataService';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '../shared/ui/LanguageSwitcher';

export default function EntityDetail() {
  const { category, slug } = useParams();
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language.split('-')[0] as 'ru' | 'en';
  
  const { data: entities, isLoading } = useQuery({
    queryKey: ['entities', 'all'],
    queryFn: loadAllEntities,
  });

  if (isLoading) return <div className="p-8">{t('common.loading')}</div>;

  const entity = entities?.find(e => e.slug === slug && e.category === category);

  if (!entity) return <div className="p-8">{t('common.notFound')}</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-8 w-full max-w-5xl mx-auto">
      <LanguageSwitcher />
      
      <nav className="mb-8 text-sm text-gray-500">
        <Link to="/" className="hover:text-blue-500">{t('common.home')}</Link> / 
        <Link to={`/${category}`} className="hover:text-blue-500 capitalize ml-1">{t(`categories.${category}`)}</Link> / 
        <span className="ml-1 text-gray-900 dark:text-gray-100">{entity.name[currentLang] || entity.name['ru']}</span>
      </nav>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700">
        <div className="p-8 md:flex gap-8">
          <div className="w-full md:w-1/3 bg-gray-100 dark:bg-gray-700 rounded-xl aspect-square flex items-center justify-center mb-6 md:mb-0 overflow-hidden">
            {entity.image ? (
              <img 
                src={entity.image.startsWith('http') ? entity.image : `.${entity.image}`} 
                alt={entity.name[currentLang] || entity.name['ru']}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://placehold.co/400?text=No+Image';
                }}
              />
            ) : (
              <div className="text-gray-400 flex flex-col items-center">
                <span className="text-4xl mb-2">🖼️</span>
                <span>No Image</span>
              </div>
            )}
          </div>
          
          <div className="flex-1">
            <h1 className="text-4xl font-bold mb-2">{entity.name[currentLang] || entity.name['ru']}</h1>
            <div className="flex flex-wrap gap-2 mb-6">
              {entity.tags.map(tag => (
                <span key={tag} className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-full text-xs font-medium">
                  {tag}
                </span>
              ))}
            </div>
            
            <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed mb-8">
              {entity.description[currentLang] || entity.description['ru']}
            </p>
            
            <div className="grid grid-cols-2 gap-4 border-t border-gray-100 dark:border-gray-700 pt-8">
              <div>
                <span className="text-xs uppercase tracking-wider text-gray-500 font-bold">{t('admin.fields.category')}</span>
                <p className="capitalize">{t(`categories.${entity.category}`)}</p>
              </div>
              <div>
                <span className="text-xs uppercase tracking-wider text-gray-500 font-bold">Last Updated</span>
                <p>{new Date(entity.updatedAt).toLocaleDateString(i18n.language)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
