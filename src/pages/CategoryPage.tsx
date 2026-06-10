import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { loadAllEntities } from "../shared/api/dataService";
import { useTranslation } from "react-i18next";
import { Header } from "../widgets/Header/ui/Header";
import { EntityCard } from "../entities/Entity/ui/EntityCard";

export default function CategoryPage() {
  const { category } = useParams();
  const { t } = useTranslation();

  const { data: entities, isLoading } = useQuery({
    queryKey: ["entities", "all"],
    queryFn: loadAllEntities,
  });

  if (isLoading)
    return (
      <div className="p-8 text-center animate-pulse">{t("common.loading")}</div>
    );

  const filteredEntities =
    entities?.filter((e) => e.category === category) || [];

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
        <span className="text-gray-400 capitalize">
          {t(`categories.${category}`)}
        </span>
      </nav>

      <h1 className="text-4xl font-black mb-8 capitalize tracking-tight">
        {t(`categories.${category}`)}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEntities.map((item) => (
          <EntityCard key={item.id} entity={item} />
        ))}
        {filteredEntities.length === 0 && (
          <div className="col-span-full text-center py-20 bg-white dark:bg-gray-800 rounded-2xl border-2 border-dashed border-gray-100 dark:border-gray-800 text-gray-400 font-medium">
            {t("common.notFound")}
          </div>
        )}
      </div>
    </div>
  );
}
