import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { loadAllEntities } from "../shared/api/dataService";
import { useTranslation } from "react-i18next";
import { Entity, Recipe } from "../shared/types/entities";
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
                {behavior && behavior !== "aggressive" && (
                  <span
                    className={`inline-block px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg shadow-lg ${
                      behavior === "boss"
                        ? "bg-red-600 text-white shadow-red-500/20 animate-pulse"
                        : behavior === "peaceful"
                          ? "bg-emerald-500 text-white shadow-emerald-500/20"
                          : "bg-amber-500 text-white shadow-amber-500/20"
                    }`}
                  >
                    {behavior} Entity
                  </span>
                )}
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
            <div className="p-8 space-y-8 relative overflow-hidden">
              {/* Background Decoration */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

              <div className="grid grid-cols-1 gap-6 relative z-10">
                {behavior && (
                  <div className="flex justify-between items-center group/item">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-xs shadow-inner">
                        🧠
                      </span>
                      <span className="text-[10px] uppercase font-black text-slate-500 tracking-wider">
                        Behavior
                      </span>
                    </div>
                    <span
                      className={`font-black capitalize px-3 py-1 rounded-lg text-xs border ${
                        behavior === "boss"
                          ? "bg-red-50 dark:bg-red-900/20 text-red-600 border-red-100 dark:border-red-800/50"
                          : behavior === "peaceful"
                            ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 border-emerald-100 dark:border-emerald-800/50"
                            : "bg-amber-50 dark:bg-amber-900/20 text-amber-600 border-amber-100 dark:border-amber-800/50"
                      }`}
                    >
                      {behavior}
                    </span>
                  </div>
                )}

                {"stats" in entity &&
                  entity.stats &&
                  Object.entries(entity.stats).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex justify-between items-center group/item"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-xs shadow-inner">
                          ⚡
                        </span>
                        <span className="text-[10px] uppercase font-black text-slate-500 tracking-wider">
                          {key.replace("_", " ")}
                        </span>
                      </div>
                      <span className="font-black text-blue-600 text-sm">
                        +{value}
                      </span>
                    </div>
                  ))}
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

function RecipeInfo({
  recipe,
  allEntities,
}: {
  recipe: Recipe;
  allEntities: Entity[];
}) {
  const { i18n } = useTranslation();
  const currentLang = i18n.language.split("-")[0] as "ru" | "en";
  const resultItem = allEntities.find((e) => e.id === recipe.resultId);
  const station = allEntities.find((e) => e.id === recipe.stationId);

  const getImagePath = (image?: string) => {
    if (!image) return null;
    return image.startsWith("http") ? image : `.${image}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <section className="p-8 bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-[3rem] relative overflow-hidden">
        {/* Background Accent */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

        <h3 className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
          <span className="w-8 h-[1px] bg-blue-600/30"></span>
          Crafting Recipe
          <span className="w-8 h-[1px] bg-blue-600/30"></span>
        </h3>

        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 relative z-10">
          {/* Ingredients List */}
          <div className="flex-1 w-full max-w-md">
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 ml-1 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
              Ingredients Required
            </div>
            <div className="grid grid-cols-1 gap-3">
              {recipe.ingredients.map((ing, idx) => {
                const item = allEntities.find((e) => e.id === ing.id);
                return (
                  <motion.div
                    key={ing.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <Link
                      to={`/${item?.category || "materials"}/${item?.slug || ing.id}`}
                      className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl hover:border-blue-500/50 transition-all group shadow-sm hover:shadow-md"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 overflow-hidden flex items-center justify-center p-2 group-hover:scale-105 transition-transform">
                          {item?.image ? (
                            <img
                              src={getImagePath(item.image)!}
                              alt=""
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <span className="text-xl opacity-20">
                              {item?.category === "materials" ? "💎" : "⚔️"}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-sm text-slate-700 dark:text-slate-200 group-hover:text-blue-600 transition-colors">
                            {item?.name[currentLang] ||
                              item?.name["ru"] ||
                              ing.id}
                          </span>
                          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-tight">
                            {item?.category || "material"}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="font-black text-lg text-blue-600">
                          x{ing.quantity}
                        </span>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Transition Arrow */}
          <div className="hidden lg:flex flex-col items-center gap-2">
            <motion.div
              animate={{ x: [0, 5, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </motion.div>
          </div>
          <div className="lg:hidden w-full h-px bg-slate-100 dark:bg-slate-800 my-4 relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-blue-600 rotate-90"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </div>
          </div>

          {/* Result Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="flex-1 w-full max-w-md flex flex-col items-center lg:items-end"
          >
            <div className="w-full">
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 ml-1 flex items-center gap-2 lg:justify-end">
                Resulting Product
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
              </div>
              {resultItem && (
                <Link
                  to={`/${resultItem.category}/${resultItem.slug}`}
                  className="flex flex-col items-center p-8 bg-white dark:bg-slate-900 border-2 border-blue-500/20 rounded-[2.5rem] hover:border-blue-500 transition-all group shadow-xl shadow-blue-500/5 w-full relative overflow-hidden"
                >
                  {/* Shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-blue-500/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

                  <div className="w-24 h-24 rounded-3xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mb-6 border border-blue-100 dark:border-blue-900/30 group-hover:scale-110 transition-transform duration-500 p-4 shadow-inner">
                    {resultItem.image ? (
                      <img
                        src={getImagePath(resultItem.image)!}
                        alt=""
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <span className="text-4xl group-hover:rotate-12 transition-transform">
                        🎁
                      </span>
                    )}
                  </div>

                  <div className="text-center">
                    <div className="text-[10px] text-blue-600 font-black uppercase tracking-widest mb-1">
                      {resultItem.category}
                    </div>
                    <div className="font-black text-2xl text-slate-900 dark:text-white leading-tight">
                      {resultItem.name[currentLang] || resultItem.name["ru"]}
                    </div>
                    {recipe.resultQuantity > 1 && (
                      <div className="mt-2 inline-block px-4 py-1 bg-blue-600 text-white text-xs font-black rounded-full">
                        Quantity: {recipe.resultQuantity}
                      </div>
                    )}
                  </div>
                </Link>
              )}
            </div>
          </motion.div>
        </div>

        {station && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-12 pt-8 border-t border-slate-100 dark:border-slate-800/50 flex flex-col sm:flex-row items-center gap-4 justify-center"
          >
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Crafting Station:
            </span>
            <Link
              to={`/${station.category}/${station.slug}`}
              className="flex items-center gap-3 px-6 py-2 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-blue-600 hover:text-white transition-all font-bold text-sm"
            >
              <span>📍</span>
              {station.name[currentLang] || station.name["ru"]}
            </Link>
          </motion.div>
        )}
      </section>
    </motion.div>
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
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span>
            Primary Habitat
          </h3>
          <Link
            to={`/locations/${habitat.slug}`}
            className="group inline-flex items-center gap-6 p-6 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 hover:border-blue-500/50 transition-all shadow-sm hover:shadow-xl overflow-hidden relative"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-500/10 transition-colors"></div>
            <div className="w-20 h-20 bg-slate-50 dark:bg-blue-950 rounded-3xl flex items-center justify-center text-4xl group-hover:scale-110 transition-transform duration-500 shadow-inner overflow-hidden border border-slate-100 dark:border-slate-800/50">
              {habitat.image ? (
                <img
                  src={
                    habitat.image.startsWith("http")
                      ? habitat.image
                      : `.${habitat.image}`
                  }
                  className="w-full h-full object-cover"
                  alt=""
                />
              ) : (
                "🗺️"
              )}
            </div>
            <div>
              <span className="block text-2xl font-black group-hover:text-blue-600 transition-colors tracking-tight">
                {habitat.name[currentLang] || habitat.name["ru"]}
              </span>
              <span className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2">
                Explore Location →
              </span>
            </div>
          </Link>
        </div>
      )}

      {drops && drops.length > 0 && (
        <div>
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></span>
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
                  className="flex justify-between items-center p-4 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 hover:border-blue-500/50 transition-all shadow-sm group relative overflow-hidden"
                >
                  <div className="flex items-center gap-4 relative z-10">
                    <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-500 shadow-inner overflow-hidden border border-slate-100/50 dark:border-slate-800/50">
                      {item.image ? (
                        <img
                          src={
                            item.image.startsWith("http")
                              ? item.image
                              : `.${item.image}`
                          }
                          className="w-full h-full object-contain p-2"
                          alt=""
                        />
                      ) : (
                        "💎"
                      )}
                    </div>
                    <div>
                      <span className="block font-black text-sm group-hover:text-blue-600 transition-colors">
                        {item.name[currentLang] || item.name["ru"]}
                      </span>
                      <span className="block text-[9px] uppercase font-black text-slate-400 tracking-widest mt-0.5">
                        {item.category}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end relative z-10">
                    <span className="text-[10px] font-black text-blue-500 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full border border-blue-100 dark:border-blue-800/50">
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
