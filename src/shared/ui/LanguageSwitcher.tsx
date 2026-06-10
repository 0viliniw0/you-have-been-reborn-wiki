import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';

export const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const queryClient = useQueryClient();

  const toggleLanguage = () => {
    const newLang = i18n.language.startsWith('en') ? 'ru' : 'en';
    i18n.changeLanguage(newLang).then(() => {
      queryClient.invalidateQueries();
    });
  };

  return (
    <motion.button 
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={toggleLanguage}
      className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-800 font-black text-[10px] uppercase tracking-wider"
    >
      <span className="opacity-70">{i18n.language.startsWith('en') ? '🇺🇸' : '🇷🇺'}</span>
      <span>{i18n.language.startsWith('en') ? 'English' : 'Русский'}</span>
    </motion.button>
  );
};
