import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { loadAllEntities } from "../shared/api/dataService";
import { useTranslation } from "react-i18next";
import { EntityCard } from "../entities/Entity/ui/EntityCard";
import { motion } from "framer-motion";
import { CategoryHeader } from "../widgets/CategoryHeader/ui/CategoryHeader";

export default function CategoryPage() {
  const { category } = useParams();
  const { t } = useTranslation();

  const { data: entities, isLoading } = useQuery({
    queryKey: ["entities", "all"],
    queryFn: loadAllEntities,
  });

  if (isLoading)
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 font-black uppercase tracking-widest text-slate-400 animate-pulse">
          {t("common.loading")}
        </p>
      </div>
    );

  const filteredEntities =
    entities?.filter((e) => e.category === category) || [];

  return (
    <div className="flex flex-col">
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
        <nav className="mb-12 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em]">
          <Link
            to="/"
            className="text-slate-400 hover:text-blue-600 transition-colors"
          >
            {t("common.home")}
          </Link>
          <span className="text-slate-300 dark:text-slate-700">/</span>
          <span className="text-blue-600">{t(`categories.${category}`)}</span>
        </nav>

        <CategoryHeader category={category} count={filteredEntities.length} />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEntities.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <EntityCard entity={item} />
            </motion.div>
          ))}

          {filteredEntities.length === 0 && (
            <div className="col-span-full text-center py-32 bg-white dark:bg-slate-900 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
              <span className="text-6xl block mb-4">🔍</span>
              <h3 className="text-2xl font-black mb-2">
                {t("common.notFound")}
              </h3>
              <p className="text-slate-400 font-medium">
                Try checking another category or come back later.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
