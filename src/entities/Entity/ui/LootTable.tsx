import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Entity, Bestiary, Equipment } from "../../../shared/types/entities";

interface LootTableProps {
  entity: Entity;
  allEntities: Entity[];
}

export const LootTable = ({ entity, allEntities }: LootTableProps) => {
  const { i18n } = useTranslation();
  const currentLang = i18n.language.split("-")[0] as "ru" | "en";

  const findEntity = (id: string) => allEntities.find((e) => e.id === id);

  // 1. Handle Monster Drops
  const isMonster = entity.category === "bestiary";
  const hasDrops = isMonster && (entity as Bestiary).drops && (entity as Bestiary).drops!.length > 0;

  // 2. Handle Equipment Skills
  const isEquipment = entity.category === "equipment";
  const hasSkills = isEquipment && (entity as Equipment).skillIds && (entity as Equipment).skillIds.length > 0;

  if (!hasDrops && !hasSkills) return null;

  return (
    <div className="space-y-12 pt-12 border-t border-slate-100 dark:border-slate-800">
      {hasDrops && (
        <div className="space-y-6">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></span>
            Loot Table
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(entity as Bestiary).drops!.map((drop) => {
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
                          src={item.image.startsWith("http") ? item.image : `.${item.image}`}
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

      {hasSkills && (
        <div className="space-y-6">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span>
            Item Abilities & Skills
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(entity as Equipment).skillIds.map((skillId) => {
              const skill = findEntity(skillId);
              if (!skill) return null;
              return (
                <Link
                  key={skillId}
                  to={`/skills/${skill.slug}`}
                  className="flex justify-between items-center p-4 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 hover:border-blue-500/50 transition-all shadow-sm group relative overflow-hidden"
                >
                  <div className="flex items-center gap-4 relative z-10">
                    <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-500 shadow-inner overflow-hidden border border-blue-100/50 dark:border-blue-900/50">
                      {skill.image ? (
                        <img
                          src={skill.image.startsWith("http") ? skill.image : `.${skill.image}`}
                          className="w-full h-full object-contain p-2"
                          alt=""
                        />
                      ) : (
                        "🔥"
                      )}
                    </div>
                    <div>
                      <span className="block font-black text-sm group-hover:text-blue-600 transition-colors">
                        {skill.name[currentLang] || skill.name["ru"]}
                      </span>
                      <span className="block text-[9px] uppercase font-black text-blue-400 tracking-widest mt-0.5">
                        Inherent Skill
                      </span>
                    </div>
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
