import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { loadAllEntities } from "../shared/api/dataService";
import { useTranslation } from "react-i18next";
import { Header } from "../widgets/Header/ui/Header";
import { Entity } from "../shared/types/entities";

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

  const renderStats = (stats?: Record<string, number>) => {
    if (!stats) return null;
    return (
      <div className="grid grid-cols-2 gap-4 mt-4">
        {Object.entries(stats).map(([key, value]) => (
          <div key={key} className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-xl border border-gray-100 dark:border-gray-800">
            <span className="text-[10px] uppercase font-black text-gray-400 block mb-1">{key}</span>
            <span className="text-lg font-bold">+{value}</span>
          </div>
        ))}
      </div>
    );
  };

  const renderRelations = () => {
    const relations: React.ReactNode[] = [];

    // Helper to find entity by ID
    const findEntity = (id: string) => entities?.find(e => e.id === id);

    if (entity.category === 'bestiary' && entity.locationId) {
      const loc = findEntity(entity.locationId);
      if (loc) {
        relations.push(
          <div key="location" className="mt-8">
            <h3 className="text-xs font-black text-blue-600 uppercase tracking-widest mb-2 text-gray-400">Primary Habitat</h3>
            <Link to={`/locations/${loc.slug}`} className="text-xl font-bold hover:text-blue-600 transition-colors underline decoration-blue-200 decoration-4 underline-offset-4">
              {loc.name[currentLang] || loc.name['ru']}
            </Link>
          </div>
        );
      }
    }

    if (entity.category === 'bestiary' && entity.drops?.length) {
      relations.push(
        <div key="drops" className="mt-8">
          <h3 className="text-xs font-black text-blue-600 uppercase tracking-widest mb-4">Drop Table</h3>
          <div className="space-y-2">
            {entity.drops.map(drop => {
              const item = findEntity(drop.id);
              if (!item) return null;
              return (
                <Link key={drop.id} to={`/${item.category}/${item.slug}`} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-blue-300 transition-colors">
                  <span className="font-bold">{item.name[currentLang] || item.name['ru']}</span>
                  <span className="text-xs font-black text-blue-500 bg-blue-50 px-2 py-1 rounded-full">{drop.chance}%</span>
                </Link>
              );
            })}
          </div>
        </div>
      );
    }

    if (entity.category === 'npcs' && entity.locationId) {
       const loc = findEntity(entity.locationId);
       if (loc) {
         relations.push(
           <div key="npc-loc" className="mt-8">
             <h3 className="text-xs font-black text-blue-600 uppercase tracking-widest mb-2 text-gray-400">Found In</h3>
             <Link to={`/locations/${loc.slug}`} className="text-xl font-bold underline decoration-blue-200 decoration-4 underline-offset-4">
               {loc.name[currentLang] || loc.name['ru']}
             </Link>
           </div>
         );
       }
    }

    return relations;
  };

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
          <div className="w-full md:w-2/5 flex flex-col gap-6">
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-[2rem] aspect-square flex items-center justify-center overflow-hidden border border-gray-100 dark:border-gray-800 shadow-inner">
              {entity.image ? (
                <img
                  src={
                    entity.image.startsWith("http")
                      ? entity.image
                      : `.${entity.image}`
                  }
                  alt={entity.name[currentLang] || entity.name["ru"]}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-gray-300 dark:text-gray-700 flex flex-col items-center">
                  <span className="text-6xl mb-4">🖼️</span>
                  <span className="font-bold uppercase tracking-widest text-sm">No Image</span>
                </div>
              )}
            </div>
            
            {(entity as any).stats && (
              <div>
                <h3 className="text-xs font-black text-blue-600 uppercase tracking-widest mb-2">Attributes / Stats</h3>
                {renderStats((entity as any).stats)}
              </div>
            )}
            
            {(entity as any).baseStats && (
              <div>
                <h3 className="text-xs font-black text-blue-600 uppercase tracking-widest mb-2">Base Attributes</h3>
                {renderStats((entity as any).baseStats)}
              </div>
            )}
          </div>

          <div className="flex-1 flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="text-xs text-blue-600 font-black uppercase tracking-[0.2em] mb-2">
                  {t(`categories.${entity.category}`)}
                </div>
                <h1 className="text-5xl font-black tracking-tight leading-tight">
                  {entity.name[currentLang] || entity.name["ru"]}
                </h1>
              </div>
              
              {(entity as any).rarity && (
                <span className={`px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-widest shadow-sm border border-white/20
                  ${(entity as any).rarity === 'legendary' ? 'bg-orange-500 text-white' : 
                    (entity as any).rarity === 'epic' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                  {(entity as any).rarity}
                </span>
              )}
            </div>

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

            <div className="flex-1 space-y-8">
              <div>
                <h3 className="text-xs font-black text-blue-600 uppercase tracking-widest mb-3">
                  {t("admin.fields.description")}
                </h3>
                <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed font-medium">
                  {entity.description[currentLang] || entity.description["ru"]}
                </p>
              </div>

              {(entity as any).effect && (
                <div>
                  <h3 className="text-xs font-black text-green-600 uppercase tracking-widest mb-3">Effect</h3>
                  <p className="text-lg font-bold">{(entity as any).effect[currentLang] || (entity as any).effect['ru']}</p>
                </div>
              )}

              {renderRelations()}
            </div>

            <div className="grid grid-cols-2 gap-8 border-t border-gray-50 dark:border-gray-800 pt-8 mt-8">
              <div>
                <span className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-black mb-2 block">
                  Identifier
                </span>
                <p className="font-mono text-sm bg-gray-50 dark:bg-gray-900 px-2 py-1 rounded inline-block">
                  {entity.slug}
                </p>
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-black mb-2 block">
                  Last Updated
                </span>
                <p className="font-bold">
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
