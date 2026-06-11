import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'ru',
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
            skills: "Skills",
            equipment: "Equipment",
            consumables: "Consumables",
            materials: "Materials",
            bestiary: "Bestiary",
            locations: "Locations",
            npcs: "NPCs",
            quests: "Quests",
            recipes: "Recipes"
          },
          recipe: {
            title: "Crafting Recipe",
            ingredients: "Ingredients Required",
            result: "Resulting Product",
            station: "Crafting Station",
            quantity: "Quantity"
          },
          admin: {
            panel: "Admin Panel",
            editor: "Local Editor",
            drafts: "Draft Entities",
            addNew: "Add New",
            export: "Export Drafts to JSON",
            edit: "Edit Entity",
            delete: "Delete",
            deleteConfirm: "Are you sure you want to delete this entity? This will be applied to disk when you push changes.",
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
            skills: "Навыки",
            equipment: "Снаряжение",
            consumables: "Расходники",
            materials: "Материалы",
            bestiary: "Бестиарий",
            locations: "Локации",
            npcs: "NPC",
            quests: "Квесты",
            recipes: "Рецепты"
          },
          recipe: {
            title: "Рецепт крафта",
            ingredients: "Необходимые ингредиенты",
            result: "Результат крафта",
            station: "Станция крафта",
            quantity: "Количество"
          },
          admin: {
            panel: "Админ-панель",
            editor: "Локальный редактор",
            drafts: "Черновики",
            addNew: "Добавить",
            export: "Экспорт в JSON",
            edit: "Редактировать",
            delete: "Удалить",
            deleteConfirm: "Вы уверены, что хотите удалить эту сущность? Изменения будут применены к диску при нажатии 'Push Changes to Disk'.",
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
