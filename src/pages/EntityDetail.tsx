import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { loadAllEntities } from "../shared/api/dataService";
import { useTranslation } from "react-i18next";
import { Header } from "../widgets/Header/ui/Header";

export default function EntityDetail() {
  const { category, slug } = useParams();
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language.split("-")[0] as "ru" | "en";

  const { data: entities, isLoading } = useQuery({
    queryKey: ["entities", "all"],
    queryFn: loadAllEntities,
  });

  if (isLoading)
    return (
      <div className="p-8 text-center animate-pulse">{t("common.loading")}</div>
    );

  const entity = entities?.find(
    (e) => e.slug === slug && e.category === category,
  );

  if (!entity)
    return <div className="p-8 text-center">{t("common.notFound")}</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-8 w-full">
      <Header />

      <nav className="mb-8 text-sm font-medium">
        <Link
          to="/"
          className="text-blue-600 hover:text-blue-500 transition-colors"
        >
          {t("common.home")}
        </Link>
        <span className="mx-2 text-gray-300">/</span>
        <Link
          to={`/${category}`}
          className="text-blue-600 hover:text-blue-500 transition-colors capitalize"
        >
          {t(`categories.${category}`)}
        </Link>
        <span className="mx-2 text-gray-300">/</span>
        <span className="text-gray-400">
          {entity.name[currentLang] || entity.name["ru"]}
        </span>
      </nav>

      <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800 transition-all">
        <div className="p-10 md:flex gap-12">
          <div className="w-full md:w-2/5 bg-gray-50 dark:bg-gray-900/50 rounded-[2rem] aspect-square flex items-center justify-center mb-8 md:mb-0 overflow-hidden border border-gray-100 dark:border-gray-800 shadow-inner">
            {entity.image ? (
              <img
                src={
                  entity.image.startsWith("http")
                    ? entity.image
                    : `.${entity.image}`
                }
                alt={entity.name[currentLang] || entity.name["ru"]}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "https://placehold.co/600?text=No+Image";
                }}
              />
            ) : (
              <div className="text-gray-300 dark:text-gray-700 flex flex-col items-center">
                <span className="text-6xl mb-4">🖼️</span>
                <span className="font-bold uppercase tracking-widest text-sm">
                  No Image
                </span>
              </div>
            )}
          </div>

          <div className="flex-1 flex flex-col">
            <h1 className="text-5xl font-black mb-4 tracking-tight leading-tight">
              {entity.name[currentLang] || entity.name["ru"]}
            </h1>

            <div className="flex flex-wrap gap-2 mb-8">
              {entity.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-4 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-xs font-black uppercase tracking-wider"
                >
                  #{tag}
                </span>
              ))}
            </div>

            <div className="flex-1">
              <h3 className="text-xs font-black text-blue-600 uppercase tracking-widest mb-3">
                {t("admin.fields.description")}
              </h3>
              <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed font-medium">
                {entity.description[currentLang] || entity.description["ru"]}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-8 border-t border-gray-50 dark:border-gray-800 pt-8 mt-8">
              <div>
                <span className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-black mb-2 block">
                  {t("admin.fields.category")}
                </span>
                <p className="capitalize font-bold text-lg">
                  {t(`categories.${entity.category}`)}
                </p>
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-black mb-2 block">
                  Updated
                </span>
                <p className="font-bold text-lg">
                  {new Date(entity.updatedAt).toLocaleDateString(
                    i18n.language,
                    { day: "numeric", month: "long", year: "numeric" },
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
