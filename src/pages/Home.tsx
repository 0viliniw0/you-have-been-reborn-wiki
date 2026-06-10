import { useQuery } from '@tanstack/react-query';
import { loadAllEntities } from '../shared/api/dataService';
import { initSearchIndex, searchEntities } from '../features/search/searchEngine';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Entity } from '../shared/types/entities';
import { Header } from '../widgets/Header/ui/Header';
import { EntityCard } from '../entities/Entity/ui/EntityCard';

export default function Home() {
  const { t } = useTranslation();

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

  const categories = [
    'skills', 
    'equipment', 
    'consumables', 
    'materials', 
    'bestiary', 
    'locations', 
    'npcs', 
    'quests'
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-8">
      <Header />

      <div className="max-w-2xl mx-auto mb-12">
        <input
          type="text"
          placeholder={t('search.placeholder')}
          className="w-full p-4 rounded-2xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 shadow-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
        />
        
        {results.length > 0 && (
          <div className="mt-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl overflow-hidden divide-y divide-gray-50 dark:divide-gray-700">
            {results.slice(0, 10).map((item) => (
              <EntityCard key={item.id} entity={item} variant="compact" />
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
