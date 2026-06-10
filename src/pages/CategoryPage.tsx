import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { loadAllEntities } from '../shared/api/dataService';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '../shared/ui/LanguageSwitcher';

export default function CategoryPage() {
  const { category } = useParams();
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language.split('-')[0] as 'ru' | 'en';
  
  const { data: entities, isLoading } = useQuery({
    queryKey: ['entities', 'all'],
    queryFn: loadAllEntities,
  });

  if (isLoading) return <div className="p-8">{t('common.loading')}</div>;

  const filteredEntities = entities?.filter(e => e.category === category) || [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-8 w-full max-w-5xl mx-auto">
      <LanguageSwitcher />
      
      <nav className="mb-8 text-sm text-gray-500">
        <Link to="/" className="hover:text-blue-500">{t('common.home')}</Link> / 
        <span className="ml-1 text-gray-900 dark:text-gray-100 capitalize">{t(`categories.${category}`)}</span>
      </nav>

      <h1 className="text-4xl font-bold mb-8 capitalize">{t(`categories.${category}`)}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEntities.map((item) => (
          <Link
            key={item.id}
            to={`/${item.category}/${item.slug}`}
            className="group p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all flex gap-4"
          >
            {item.image && (
              <div className="w-16 h-16 rounded-lg bg-gray-50 dark:bg-gray-700 flex-shrink-0 overflow-hidden">
                <img 
                  src={item.image.startsWith('http') ? item.image : `.${item.image}`} 
                  alt="" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                />
              </div>
            )}
            <div>
              <h3 className="text-xl font-bold mb-1">{item.name[currentLang] || item.name['ru']}</h3>
              <p className="text-sm text-gray-500 line-clamp-2">{item.description[currentLang] || item.description['ru']}</p>
            </div>
          </Link>
        ))}
        {filteredEntities.length === 0 && (
          <div className="col-span-full text-center py-20 text-gray-500">
            {t('common.notFound')}
          </div>
        )}
      </div>
    </div>
  );
}
