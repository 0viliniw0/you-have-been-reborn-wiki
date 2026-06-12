import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Entity,
  Bestiary,
  Npc,
  Recipe,
  Equipment,
} from "../../../shared/types/entities";

interface EntityRelationsProps {
  entity: Entity;
  entities: Entity[];
}

export const EntityRelations = ({ entity, entities }: EntityRelationsProps) => {
  const { i18n } = useTranslation();
  const currentLang = i18n.language.split("-")[0] as "ru" | "en";
  const findEntity = (id: string) => entities?.find((e) => e.id === id);

  // --- Forward Relations ---
  const habitats =
    entity.category === "bestiary" && entity.locationIds
      ? entity.locationIds.map((id) => findEntity(id)).filter(Boolean)
      : [];

  const npcLocations =
    entity.category === "npcs" && entity.locationIds
      ? entity.locationIds.map((id) => findEntity(id)).filter(Boolean)
      : [];

  const itemSkills =
    entity.category === "equipment" && entity.skillIds
      ? entity.skillIds.map((id) => findEntity(id)).filter(Boolean)
      : [];

  // --- Reverse Relations ---
  const locationInhabitants =
    entity.category === "locations"
      ? (entities.filter(
          (e) =>
            (e.category === "bestiary" &&
              (e as Bestiary).locationIds?.includes(entity.id)) ||
            (e.category === "npcs" &&
              (e as Npc).locationIds?.includes(entity.id)),
        ) as (Bestiary | Npc)[])
      : [];

  const droppedBy = ["equipment", "consumables", "materials"].includes(
    entity.category,
  )
    ? (entities.filter(
        (e) =>
          e.category === "bestiary" &&
          (e as Bestiary).drops?.some((d) => d.id === entity.id),
      ) as Bestiary[])
    : [];

  const skillGivers =
    entity.category === "skills"
      ? (entities.filter(
          (e) =>
            e.category === "equipment" &&
            (e as Equipment).skillIds?.includes(entity.id),
        ) as Equipment[])
      : [];

  // --- Recipe Relations ---
  const producedBy = entities.filter(
    (e) => e.category === "recipes" && (e as Recipe).resultId === entity.id,
  ) as Recipe[];

  const usedInRecipes = entities.filter(
    (e) =>
      e.category === "recipes" &&
      (e as Recipe).ingredients.some((i) => i.id === entity.id),
  ) as Recipe[];

  const manualRelations = (entity.relatedIds || [])
    .map((id) => findEntity(id))
    .filter(Boolean) as Entity[];
  const referencedBy = entities.filter((e) =>
    e.relatedIds?.includes(entity.id),
  );

  interface SectionItem {
    entity: Entity;
    subtitle: string;
    badge?: string;
  }

  const sections: { title: string; items: SectionItem[] }[] = [
    {
      title: "Located In",
      items: [...habitats, ...npcLocations]
        .filter((e): e is Entity => Boolean(e))
        .map((e) => ({ entity: e, subtitle: "Primary Location" })),
    },
    {
      title: "Grants Skills",
      items: itemSkills
        .filter((e): e is Entity => Boolean(e))
        .map((e) => ({
          entity: e,
          subtitle: "Inherent Ability",
        })),
    },
    {
      title: "Available from Equipment",
      items: skillGivers.map((e) => ({ entity: e, subtitle: "Equipment" })),
    },
    {
      title: "Local Inhabitants",
      items: locationInhabitants.map((e) => ({
        entity: e,
        subtitle: e.category.toUpperCase(),
      })),
    },
    {
      title: "Dropped By",
      items: droppedBy.map((e) => ({ entity: e, subtitle: "Mob Drop" })),
    },
    {
      title: "Can be Crafted",
      items: producedBy.map((r) => ({ entity: r, subtitle: "Recipe Details" })),
    },
    {
      title: "Used in Recipes",
      items: usedInRecipes.map((r) => ({
        entity: findEntity(r.resultId) || r,
        subtitle: `Crafting Ingredient`,
      })),
    },
    {
      title: "Related Content",
      items: manualRelations.map((e) => ({
        entity: e,
        subtitle: e.category.toUpperCase(),
      })),
    },
    {
      title: "Also Related To",
      items: referencedBy.map((e) => ({
        entity: e,
        subtitle: e.category.toUpperCase(),
      })),
    },
  ].filter((s) => s.items.length > 0);

  if (sections.length === 0) return null;

  return (
    <div className="space-y-16">
      {sections.map((section, idx) => (
        <div
          key={idx}
          className="animate-in fade-in slide-in-from-bottom-4 duration-700"
        >
          <div className="flex items-center gap-4 mb-8">
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 whitespace-nowrap">
              {section.title}
            </h3>
            <div className="h-px w-full bg-slate-100 dark:bg-slate-800/50"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {section.items.map((item, itemIdx) => (
              <Link
                key={itemIdx}
                to={`/${item.entity.category}/${item.entity.slug}`}
                className="flex items-center gap-4 p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/5 transition-all group overflow-hidden relative"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 via-transparent to-transparent opacity-0 group-hover:opacity-10 transition-opacity"></div>

                <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center flex-shrink-0 shadow-inner group-hover:scale-110 transition-transform duration-500 overflow-hidden">
                  {item.entity.image ? (
                    <img
                      src={
                        item.entity.image.startsWith("http")
                          ? item.entity.image
                          : `.${item.entity.image}`
                      }
                      className="w-full h-full object-contain p-2"
                      alt=""
                    />
                  ) : (
                    <span className="text-xl opacity-20">📦</span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="font-black text-sm text-slate-900 dark:text-slate-100 truncate group-hover:text-blue-600 transition-colors">
                    {item.entity.name[currentLang] || item.entity.name.ru}
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <div className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                      {item.subtitle || item.entity.category}
                    </div>
                    {item.badge && (
                      <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 text-[8px] font-black rounded-full border border-blue-100 dark:border-blue-800/50">
                        {item.badge}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
