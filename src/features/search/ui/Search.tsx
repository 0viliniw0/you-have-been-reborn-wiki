import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { loadAllEntities } from '../../../shared/api/dataService';
import { initSearchIndex, searchEntities } from '../searchEngine';
import { Entity } from '../../../shared/types/entities';
import { EntityCard } from '../../../entities/Entity/ui/EntityCard';

interface SearchProps {
  variant?: 'hero' | 'compact';
}

export const Search = ({ variant = 'compact' }: SearchProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Entity[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const { data: entities } = useQuery({
    queryKey: ['entities', 'all'],
    queryFn: loadAllEntities,
  });

  useEffect(() => {
    if (entities) initSearchIndex(entities);
  }, [entities]);

  useEffect(() => {
    if (query.length > 0) {
      setResults(searchEntities(query) as Entity[]);
      setIsOpen(true);
    } else {
      setResults([]);
      setIsOpen(false);
    }
  }, [query]);

  // Close search on escape or click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close search on navigation
  useEffect(() => {
    setIsOpen(false);
    setQuery('');
  }, [location.pathname]);

  const isHero = variant === 'hero';

  return (
    <div ref={containerRef} className={`relative w-full ${isHero ? 'max-w-2xl mx-auto' : 'max-w-xs hidden md:block'}`}>
      <div className={`relative group transition-all duration-300 ${isHero ? '' : 'focus-within:max-w-md'}`}>
        {isHero && (
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur opacity-25 group-focus-within:opacity-50 transition-opacity"></div>
        )}
        <div className="relative flex items-center">
          <span className="absolute left-4 text-slate-400">🔍</span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('search.placeholder')}
            className={`
              w-full pl-11 pr-4 rounded-2xl border transition-all outline-none
              ${isHero 
                ? 'p-5 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-lg shadow-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500' 
                : 'h-10 bg-slate-100 dark:bg-slate-900 border-transparent focus:bg-white dark:focus:bg-slate-800 focus:border-blue-500/50 text-sm'
              }
            `}
          />
        </div>
      </div>

      <AnimatePresence>
        {isOpen && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className={`
              absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-[100]
              divide-y divide-slate-100 dark:divide-slate-800
            `}
          >
            <div className="max-h-[60vh] overflow-y-auto">
              {results.slice(0, 8).map((item) => (
                <EntityCard key={item.id} entity={item} variant="compact" />
              ))}
            </div>
            {results.length > 8 && (
              <div className="p-3 text-center bg-slate-50 dark:bg-slate-900/50">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  {results.length - 8} more results found
                </span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
