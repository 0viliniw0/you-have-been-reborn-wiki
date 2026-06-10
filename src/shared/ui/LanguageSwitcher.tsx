import { useTranslation } from 'react-i18next';

export const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language.startsWith('en') ? 'ru' : 'en';
    i18n.changeLanguage(newLang);
    // Reload query to fetch new data
    window.location.reload();
  };

  return (
    <button 
      onClick={toggleLanguage}
      className="fixed top-4 right-4 bg-white dark:bg-gray-800 p-2 rounded-full shadow-md border border-gray-200 dark:border-gray-700 font-bold text-xs uppercase"
    >
      {i18n.language.startsWith('en') ? '🇷🇺 RU' : '🇺🇸 EN'}
    </button>
  );
};
