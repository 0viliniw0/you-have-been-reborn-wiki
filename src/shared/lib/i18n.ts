import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'ru',
    lng: 'ru',
    interpolation: {
      escapeValue: false,
    },
    resources: {
      en: {
        translation: {
          header: {
            title: "You Have Been Reborn Wiki",
            subtitle: "The ultimate static game database"
          },
          search: {
            placeholder: "Search items, mobs, skills...",
            results: "Search Results"
          },
          categories: {
            items: "Items",
            mobs: "Mobs",
            skills: "Skills",
            locations: "Locations",
            quests: "Quests",
            recipes: "Recipes",
            achievements: "Achievements"
          },
          admin: {
            panel: "Admin Panel",
            editor: "Local Editor",
            drafts: "Draft Entities",
            addNew: "Add New",
            export: "Export Drafts to JSON",
            edit: "Edit Entity",
            delete: "Delete Draft",
            fields: {
              name: "Name",
              slug: "Slug",
              category: "Category",
              description: "Description",
              tags: "Tags"
            }
          },
          common: {
            home: "Home",
            loading: "Loading...",
            notFound: "Not Found",
            save: "Save",
            cancel: "Cancel"
          }
        }
      },
      ru: {
        translation: {
          header: {
            title: "You Have Been Reborn Wiki",
            subtitle: "Полная база данных игры"
          },
          search: {
            placeholder: "Поиск предметов, мобов, навыков...",
            results: "Результаты поиска"
          },
          categories: {
            items: "Предметы",
            mobs: "Мобы",
            skills: "Навыки",
            locations: "Локации",
            quests: "Квесты",
            recipes: "Рецепты",
            achievements: "Достижения"
          },
          admin: {
            panel: "Админ-панель",
            editor: "Локальный редактор",
            drafts: "Черновики",
            addNew: "Добавить",
            export: "Экспорт в JSON",
            edit: "Редактировать",
            delete: "Удалить",
            fields: {
              name: "Название",
              slug: "Slug (ЧПУ)",
              category: "Категория",
              description: "Описание",
              tags: "Теги"
            }
          },
          common: {
            home: "Главная",
            loading: "Загрузка...",
            notFound: "Не найдено",
            save: "Сохранить",
            cancel: "Отмена"
          }
        }
      }
    }
  });

export default i18n;
