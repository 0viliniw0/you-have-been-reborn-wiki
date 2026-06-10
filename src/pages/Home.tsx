import { useQuery } from '@tanstack/react-query';
import { loadAllEntities } from '../shared/api/dataService';
import { initSearchIndex, searchEntities } from '../features/search/searchEngine';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '../shared/ui/LanguageSwitcher';
import { Entity } from '../shared/types/entities';

export default function Home() {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language.split('-')[0] as 'ru' | 'en';

  const { data: entities } = useQuery({
    queryKey: ['entities', 'all'],
    queryFn: loadAllEntities,
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<Entity[]>([]);

  useEffect(() => {
    if (entities) {
      initSearchIndex(entities);
    }
  }, [entities]);

  const handleSearch = (q: string) => {
    setSearchQuery(q);
    setResults(searchEntities(q));
  };

  const categories = ['items', 'mobs', 'skills', 'locations', 'quests', 'recipes', 'achievements'];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-8">
      <LanguageSwitcher />
      
      <header className="max-w-4xl mx-auto text-center mb-12">
        <h1 className="text-5xl font-bold mb-4">{t('header.title')}</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">{t('header.subtitle')}</p>
      </header>

      <div className="max-w-2xl mx-auto mb-12">
        <input
          type="text"
          placeholder={t('search.placeholder')}
          className="w-full p-4 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm focus:ring-2 focus:ring-blue-500"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
        />
        
        {results.length > 0 && (
          <div className="mt-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden">
            {results.slice(0, 10).map((item) => (
              <Link
                key={item.id}
                to={`/${item.category}/${item.slug}`}
                className="block p-4 hover:bg-gray-100 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-0"
              >
                <div className="font-bold">{item.name[currentLang] || item.name['ru']}</div>
                <div className="text-sm text-gray-500">{t(`categories.${item.category}`)} • {item.tags.join(', ')}</div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
        {categories.map((cat) => (
          <Link
            key={cat}
            to={`/${cat}`}
            className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 text-center hover:shadow-md transition-shadow font-semibold"
          >
            {t(`categories.${cat}`)}
          </Link>
        ))}
      </div>
      
      {import.meta.env.DEV && (
        <div className="mt-12 text-center">
          <Link to="/admin" className="text-blue-500 hover:underline">{t('admin.panel')}</Link>
        </div>
      )}
    </div>
  );
}
