import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Entity } from "../../../shared/types/entities";

interface EntityRelationsProps {
  entity: Entity;
  entities: Entity[];
}

export const EntityRelations = ({
  entity,
  entities,
}: EntityRelationsProps) => {
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
};
