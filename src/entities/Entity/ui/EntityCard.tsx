import { Link } from "react-router-dom";
import { Entity } from "../../../shared/types/entities";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";

interface EntityCardProps {
  entity: Entity;
  variant?: "compact" | "full";
}

export const EntityCard = ({ entity, variant = "full" }: EntityCardProps) => {
  const { i18n } = useTranslation();
  const currentLang = i18n.language.split("-")[0] as "ru" | "en";

  const behavior = entity.category === "bestiary" ? entity.behavior : null;

  const stripMarkdown = (text: string) => {
    return text
      .replace(/[#*`_>]/g, "")
      .replace(/\[(.*?)\]\(.*?\)/g, "$1")
      .trim();
  };

  if (variant === "compact") {
    return (
      <Link to={`/${entity.category}/${entity.slug}`} className="block">
        <div className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 flex items-center justify-between transition-colors group">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-900 overflow-hidden flex-shrink-0 flex items-center justify-center border border-slate-200/50 dark:border-slate-800/50">
              {entity.image ? (
                <img
                  src={
                    entity.image.startsWith("http")
                      ? entity.image
                      : `.${entity.image}`
                  }
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  alt=""
                />
              ) : (
                <span className="text-sm opacity-20 italic">R</span>
              )}
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm text-slate-700 dark:text-slate-200">
                {entity.name[currentLang] || entity.name["ru"]}
              </span>
              {behavior && (
                <span
                  className={`text-[7px] w-fit px-1 py-0.5 rounded-md font-black uppercase tracking-widest ${
                    behavior === "boss"
                      ? "bg-red-600 text-white animate-pulse"
                      : behavior === "peaceful"
                        ? "bg-emerald-500 text-white"
                        : "bg-amber-500 text-white"
                  }`}
                >
                  {behavior}
                </span>
              )}
            </div>
          </div>
          <span className="text-[9px] uppercase font-black text-slate-400 tracking-widest">
            {entity.category}
          </span>
        </div>
      </Link>
    );
  }

  return (
    <Link
      to={`/${entity.category}/${entity.slug}`}
      className="block h-full group"
    >
      <motion.div
        whileHover={{ y: -8, scale: 1.02 }}
        className={`h-full p-px rounded-[2.5rem] bg-gradient-to-br from-slate-200 to-slate-100 dark:from-slate-800 dark:to-slate-900 transition-all shadow-sm hover:shadow-2xl hover:shadow-blue-500/10 relative overflow-hidden`}
      >
        <div className="bg-white dark:bg-slate-950 h-full rounded-[2.4rem] p-8 flex flex-col relative z-10 overflow-hidden">
          {/* Background Ambient Glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-500/10 transition-colors"></div>

          <div className="flex items-start justify-between mb-8">
            <div className="w-20 h-20 rounded-3xl bg-slate-50 dark:bg-slate-900 flex-shrink-0 overflow-hidden border border-slate-100 dark:border-slate-800 group-hover:border-blue-500/30 transition-all duration-500 shadow-inner p-3">
              {entity.image ? (
                <img
                  src={
                    entity.image.startsWith("http")
                      ? entity.image
                      : `.${entity.image}`
                  }
                  alt=""
                  className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-3xl grayscale opacity-10">
                  🖼️
                </div>
              )}
            </div>
            {behavior && (
              <span
                className={`text-[9px] px-3 py-1 rounded-full font-black uppercase tracking-[0.15em] shadow-xl ${
                  behavior === "boss"
                    ? "bg-red-600 text-white shadow-red-500/20 animate-pulse"
                    : behavior === "peaceful"
                      ? "bg-emerald-500 text-white shadow-emerald-500/20"
                      : "bg-amber-500 text-white shadow-amber-500/20"
                }`}
              >
                {behavior}
              </span>
            )}
          </div>

          <div className="flex-1 relative">
            <div className="text-[9px] uppercase font-black tracking-[0.3em] text-blue-600 dark:text-blue-400 mb-2">
              {entity.category}
            </div>
            <h3 className="text-2xl font-black tracking-tight leading-none group-hover:text-blue-600 transition-colors mb-4">
              {entity.name[currentLang] || entity.name["ru"]}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed font-medium">
              {stripMarkdown(
                entity.description[currentLang] || entity.description["ru"],
              )}
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-50 dark:border-slate-900 flex items-center justify-between">
            <div className="flex gap-1">
              {entity.tags.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className="text-[8px] font-black uppercase tracking-widest text-slate-400"
                >
                  #{tag}
                </span>
              ))}
            </div>
            <span className="text-blue-600 text-xs font-black opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all">
              READ MORE →
            </span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
};
