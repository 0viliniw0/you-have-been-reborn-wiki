import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { loadAllEntities } from "../shared/api/dataService";
import { useTranslation } from "react-i18next";
import { Entity } from "../shared/types/entities";
import ReactMarkdown from "react-markdown";
import { motion } from "framer-motion";

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

  const behavior = entity.category === "bestiary" ? entity.behavior : null;

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
                {behavior && behavior !== 'aggressive' && (
                  <span className={`inline-block px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg shadow-lg ${
                    behavior === 'boss' ? 'bg-red-600 text-white shadow-red-500/20 animate-pulse' :
                    behavior === 'peaceful' ? 'bg-emerald-500 text-white shadow-emerald-500/20' :
                    'bg-amber-500 text-white shadow-amber-500/20'
                  }`}>
                    {behavior} Entity
                  </span>
                )}
              </div>
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-none mb-8">
                {entity.name[currentLang] || entity.name["ru"]}
              </h1>

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
            </motion.div>
          </header>

          <section className="prose prose-slate dark:prose-invert max-w-none">
            <ReactMarkdown>
              {entity.description[currentLang] || entity.description["ru"]}
            </ReactMarkdown>
          </section>

          {"effect" in entity && entity.effect && (
            <section className="relative p-8 rounded-[2.5rem] bg-gradient-to-br from-emerald-500/5 to-teal-500/5 border border-emerald-500/10 overflow-hidden">
              <div className="absolute top-0 right-0 p-8 text-6xl opacity-5 grayscale">
                ✨
              </div>
              <h3 className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.2em] mb-4">
                Unique Effect
              </h3>
              <div className="text-2xl font-bold italic leading-relaxed text-slate-700 dark:text-slate-200">
                <ReactMarkdown>
                  {entity.effect[currentLang] || entity.effect["ru"]}
                </ReactMarkdown>
              </div>
            </section>
          )}

          {/* Relations (Drops, Locations, etc.) */}
          <Relations entity={entity} entities={entities || []} />
        </div>

        {/* Infobox Sidebar */}
        <aside className="lg:col-span-4 sticky top-24">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden"
          >
            {/* Entity Image */}
            <div className="aspect-square bg-slate-50 dark:bg-slate-800/50 p-8 flex items-center justify-center relative group">
              {entity.image ? (
                <img
                  src={
                    entity.image.startsWith("http")
                      ? entity.image
                      : `.${entity.image}`
                  }
                  alt=""
                  className="w-full h-full object-contain drop-shadow-2xl group-hover:scale-110 transition-transform duration-700"
                />
              ) : (
                <span className="text-9xl grayscale opacity-10">🖼️</span>
              )}
            </div>

            {/* Infobox Stats */}
            <div className="p-8 space-y-6">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] border-b border-slate-100 dark:border-slate-800 pb-2">
                Technical Specs
              </h3>

              <div className="grid grid-cols-1 gap-4">
                {"stats" in entity &&
                  entity.stats &&
                  Object.entries(entity.stats).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex justify-between items-center py-2 border-b border-slate-50 dark:border-slate-800/50 last:border-0"
                    >
                      <span className="text-[10px] uppercase font-black text-slate-500 tracking-wider">
                        {key.replace("_", " ")}
                      </span>
                      <span className="font-black text-blue-600">+{value}</span>
                    </div>
                  ))}
                <div className="flex justify-between items-center py-2 border-b border-slate-50 dark:border-slate-800/50 last:border-0">
                  <span className="text-[10px] uppercase font-black text-slate-500 tracking-wider">
                    Category
                  </span>
                  <span className="font-black capitalize">
                    {entity.category}
                  </span>
                </div>
                {behavior && (
                  <div className="flex justify-between items-center py-2 border-b border-slate-50 dark:border-slate-800/50 last:border-0">
                    <span className="text-[10px] uppercase font-black text-slate-500 tracking-wider">
                      Behavior
                    </span>
                    <span className={`font-black capitalize ${
                      behavior === 'boss' ? 'text-red-600' :
                      behavior === 'peaceful' ? 'text-emerald-500' :
                      behavior === 'aggressive' ? 'text-amber-600' :
                      'text-amber-500'
                    }`}>
                      {behavior}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center py-2 border-b border-slate-50 dark:border-slate-800/50 last:border-0">
                  <span className="text-[10px] uppercase font-black text-slate-500 tracking-wider">
                    Identifier
                  </span>
                  <span className="font-mono text-[10px] text-slate-400">
                    {entity.slug}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-8 bg-slate-50 dark:bg-slate-800/30 text-center">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Updated: {new Date(entity.updatedAt).toLocaleDateString()}
              </span>
            </div>
          </motion.div>
        </aside>
      </div>
    </div>
  );
}

// Sub-component for relations
function Relations({
  entity,
  entities,
}: {
  entity: Entity;
  entities: Entity[];
}) {
  const { i18n } = useTranslation();
  const currentLang = i18n.language.split("-")[0] as "ru" | "en";
  const findEntity = (id: string) => entities?.find((e) => e.id === id);

  const habitat =
    entity.category === "bestiary" && entity.locationId
      ? findEntity(entity.locationId)
      : null;
  const drops = entity.category === "bestiary" ? entity.drops : [];

  if (!habitat && (!drops || drops.length === 0)) return null;

  return (
    <div className="space-y-12 pt-12 border-t border-slate-100 dark:border-slate-800">
      {habitat && (
        <div>
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6">
            Primary Habitat
          </h3>
          <Link
            to={`/locations/${habitat.slug}`}
            className="group inline-flex items-center gap-6 p-6 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 hover:border-blue-500/50 transition-all shadow-sm hover:shadow-xl"
          >
            <div className="w-16 h-16 bg-blue-50 dark:bg-blue-950 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
              🗺️
            </div>
            <div>
              <span className="block text-xl font-black group-hover:text-blue-600 transition-colors">
                {habitat.name[currentLang] || habitat.name["ru"]}
              </span>
              <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                View Location details →
              </span>
            </div>
          </Link>
        </div>
      )}

      {drops && drops.length > 0 && (
        <div>
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6">
            Loot Table
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {drops.map((drop) => {
              const item = findEntity(drop.id);
              if (!item) return null;
              return (
                <Link
                  key={drop.id}
                  to={`/${item.category}/${item.slug}`}
                  className="flex justify-between items-center p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-blue-500/50 transition-all shadow-sm group"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-2xl group-hover:scale-110 transition-transform">
                      💎
                    </span>
                    <span className="font-bold text-lg group-hover:text-blue-600 transition-colors">
                      {item.name[currentLang] || item.name["ru"]}
                    </span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-black text-blue-500 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full">
                      {drop.chance}%
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
