import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '../../../shared/ui/LanguageSwitcher';

export const Header = () => {
  const { t } = useTranslation();

  return (
    <header className="max-w-4xl mx-auto text-center mb-12 relative">
      <div className="absolute top-0 right-0">
        <LanguageSwitcher />
      </div>
      <Link to="/" className="inline-block hover:opacity-80 transition-opacity">
        <h1 className="text-5xl font-black tracking-tight mb-2 bg-gradient-to-br from-blue-600 to-blue-400 bg-clip-text text-transparent">
          {t('header.title')}
        </h1>
      </Link>
      <p className="text-xl text-gray-500 dark:text-gray-400 font-medium">{t('header.subtitle')}</p>
    </header>
  );
};
