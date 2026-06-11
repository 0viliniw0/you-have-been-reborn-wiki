import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { loadAllEntities } from "../shared/api/dataService";
import { useTranslation } from "react-i18next";
import ReactMarkdown from "react-markdown";
import { motion } from "framer-motion";
import { RecipeInfo } from "../entities/Entity/ui/RecipeInfo";
import { EntityRelations } from "../entities/Entity/ui/EntityRelations";
import { EntityInfobox } from "../entities/Entity/ui/EntityInfobox";
import { LootTable } from "../entities/Entity/ui/LootTable";

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
      <div className="flex flex-col items-center justify-center py-32">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 font-black uppercase tracking-widest text-slate-400 animate-pulse">
          {t("common.loading")}
        </p>
      </div>
    );

  const entity = entities?.find(
    (e) => e.slug === slug && e.category === category,
  );

  if (!entity)
    return (
      <div className="p-32 text-center text-2xl font-black uppercase tracking-widest text-slate-400">
        {t("common.notFound")}
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto w-full px-4 py-8">
      {/* Breadcrumbs */}
      <nav className="mb-12 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em]">
        <Link
          to="/"
          className="text-slate-400 hover:text-blue-600 transition-colors"
        >
          {t("common.home")}
        </Link>
        <span className="text-slate-300 dark:text-slate-700">/</span>
        <Link
          to={`/${category}`}
          className="text-slate-400 hover:text-blue-600 transition-colors"
        >
          {t(`categories.${category}`)}
        </Link>
        <span className="text-slate-300 dark:text-slate-700">/</span>
        <span className="text-blue-600">
          {entity.name[currentLang] || entity.name["ru"]}
        </span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Main Content */}
        <div className="lg:col-span-8 space-y-12">
          <header>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-widest rounded-lg">
                  {t(`categories.${entity.category}`)}
                </span>
              </div>
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-none mb-8">
                {entity.name[currentLang] || entity.name["ru"]}
              </h1>
              {Boolean(entity.tags.length) && (
                <div className="flex flex-wrap gap-2 mb-12">
                  {entity.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </motion.div>
          </header>

          <section className="p-12 bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-8 flex items-center gap-2">
              Lore & Details
            </h3>
            <div className="prose prose-slate dark:prose-invert max-w-none prose-p:leading-relaxed prose-p:text-slate-600 dark:prose-p:text-slate-400 prose-headings:font-black prose-headings:tracking-tight">
              <ReactMarkdown>
                {entity.description[currentLang] || entity.description["ru"]}
              </ReactMarkdown>
            </div>
          </section>
{entity.category === "recipes" && (
  <RecipeInfo recipe={entity} allEntities={entities || []} />
)}

<LootTable entity={entity} allEntities={entities || []} />
</div>

{/* Infobox Sidebar */}

        <EntityInfobox entity={entity} />
      </div>

      {/* Relations (Drops, Locations, etc.) - Moved to bottom for full width */}
      <div className="mt-20">
        <EntityRelations entity={entity} entities={entities || []} />
      </div>
    </div>
  );
}
