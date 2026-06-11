import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Entity, Recipe } from "../../../shared/types/entities";

interface RecipeInfoProps {
  recipe: Recipe;
  allEntities: Entity[];
}

export const RecipeInfo = ({ recipe, allEntities }: RecipeInfoProps) => {
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
};
