import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BaseEntity, EntityType } from '../shared/types/entities';
import { loadAllEntities } from '../shared/api/dataService';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '../shared/ui/LanguageSwitcher';

export default function AdminPanel() {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language.split('-')[0] as 'ru' | 'en';
  
  const [draftEntities, setDraftEntities] = useState<any[]>([]);
  const [selectedEntity, setSelectedEntity] = useState<any | null>(null);

  const { data: dbEntities } = useQuery({
    queryKey: ['entities', 'all'],
    queryFn: loadAllEntities,
  });

  const allAvailableEntities = [...(dbEntities || []), ...draftEntities];

  useEffect(() => {
    const saved = localStorage.getItem('wiki_draft_entities');
    if (saved) setDraftEntities(JSON.parse(saved));
  }, []);

  const saveToLocal = (newEntities: any[]) => {
    setDraftEntities(newEntities);
    localStorage.setItem('wiki_draft_entities', JSON.stringify(newEntities));
  };

  const handleCreate = () => {
    const newEntity: BaseEntity = {
      id: crypto.randomUUID(),
      slug: 'new-entity',
      name: { ru: 'Новая сущность', en: 'New Entity' },
      description: { ru: '', en: '' },
      category: 'items',
      tags: [],
      updatedAt: new Date().toISOString(),
    };
    saveToLocal([...draftEntities, newEntity]);
    setSelectedEntity(newEntity);
  };

  const updateField = (field: string, value: any) => {
    if (!selectedEntity) return;
    const updated = { ...selectedEntity, [field]: value };
    setSelectedEntity(updated);
    const newDrafts = draftEntities.map(e => e.id === updated.id ? updated : e);
    saveToLocal(newDrafts);
  };

  const updateLocalizedField = (field: string, lang: 'ru' | 'en', value: string) => {
    if (!selectedEntity) return;
    const updated = { 
      ...selectedEntity, 
      [field]: { ...selectedEntity[field], [lang]: value } 
    };
    setSelectedEntity(updated);
    const newDrafts = draftEntities.map(e => e.id === updated.id ? updated : e);
    saveToLocal(newDrafts);
  };

  const renderRelationSelect = (label: string, field: string, filterCategory?: string) => {
    const options = allAvailableEntities.filter(e => !filterCategory || e.category === filterCategory);
    return (
      <div className="mb-4">
        <label className="block text-sm font-bold mb-1">{label}</label>
        <select 
          className="w-full p-2 border rounded bg-white"
          value={selectedEntity?.[field] || ''}
          onChange={e => updateField(field, e.target.value)}
        >
          <option value="">None</option>
          {options.map(opt => (
            <option key={opt.id} value={opt.id}>
                {opt.name[currentLang] || opt.name['ru']} ({t(`categories.${opt.category}`)})
            </option>
          ))}
        </select>
      </div>
    );
  };

  const renderArrayInput = (label: string, field: string) => {
    const values = selectedEntity?.[field] || [];
    return (
      <div className="mb-4">
        <label className="block text-sm font-bold mb-1">{label}</label>
        <input 
          className="w-full p-2 border rounded"
          value={values.join(', ')}
          onChange={e => updateField(field, e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean))}
        />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 flex gap-8 font-sans">
      <LanguageSwitcher />
      
      <div className="w-1/3 bg-white p-6 rounded-xl shadow-lg flex flex-col h-[85vh]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">{t('admin.drafts')}</h2>
          <button onClick={handleCreate} className="bg-green-600 text-white px-3 py-1 rounded text-sm font-bold">{t('admin.addNew')}</button>
        </div>
        <div className="flex-1 overflow-y-auto space-y-2 pr-2">
          {draftEntities.map(e => (
            <div 
              key={e.id} 
              onClick={() => setSelectedEntity(e)}
              className={`p-3 border rounded cursor-pointer transition-colors ${selectedEntity?.id === e.id ? 'bg-blue-50 border-blue-500' : 'hover:bg-gray-50'}`}
            >
              <div className="font-bold text-sm">{e.name[currentLang] || e.name['ru']}</div>
              <div className="text-xs text-gray-400 capitalize">{t(`categories.${e.category}`)} | {e.slug}</div>
            </div>
          ))}
        </div>
        <div className="mt-6 pt-6 border-t">
            <button 
              onClick={() => {
                const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(draftEntities, null, 2));
                const link = document.createElement('a');
                link.setAttribute("href", dataStr);
                link.setAttribute("download", `exported_entities.json`);
                link.click();
              }}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold"
            >
              {t('admin.export')}
            </button>
        </div>
      </div>

      <div className="flex-1 bg-white p-8 rounded-xl shadow-lg overflow-y-auto h-[85vh]">
        {selectedEntity ? (
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold mb-6">{t('admin.edit')}: <span className="text-blue-600">{selectedEntity.name[currentLang] || selectedEntity.name['ru']}</span></h2>
            
            <div className="mb-6 grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-bold mb-1">{t('admin.fields.name')} (RU)</label>
                    <input className="w-full p-2 border rounded" value={selectedEntity.name.ru} onChange={e => updateLocalizedField('name', 'ru', e.target.value)} />
                </div>
                <div>
                    <label className="block text-sm font-bold mb-1">{t('admin.fields.name')} (EN)</label>
                    <input className="w-full p-2 border rounded" value={selectedEntity.name.en} onChange={e => updateLocalizedField('name', 'en', e.target.value)} />
                </div>
            </div>

            <div className="mb-6">
                <label className="block text-sm font-bold mb-1">{t('admin.fields.slug')}</label>
                <input className="w-full p-2 border rounded" value={selectedEntity.slug} onChange={e => updateField('slug', e.target.value)} />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-bold mb-1">{t('admin.fields.category')}</label>
              <select 
                className="w-full p-2 border rounded bg-white"
                value={selectedEntity.category}
                onChange={e => updateField('category', e.target.value)}
              >
                {['items', 'mobs', 'npcs', 'locations', 'quests', 'recipes', 'skills', 'achievements'].map(cat => (
                  <option key={cat} value={cat}>{t(`categories.${cat}`)}</option>
                ))}
              </select>
            </div>

            <div className="mb-6 space-y-4">
                <div>
                    <label className="block text-sm font-bold mb-1">{t('admin.fields.description')} (RU)</label>
                    <textarea className="w-full p-2 border rounded h-24" value={selectedEntity.description.ru} onChange={e => updateLocalizedField('description', 'ru', e.target.value)} />
                </div>
                <div>
                    <label className="block text-sm font-bold mb-1">{t('admin.fields.description')} (EN)</label>
                    <textarea className="w-full p-2 border rounded h-24" value={selectedEntity.description.en} onChange={e => updateLocalizedField('description', 'en', e.target.value)} />
                </div>
            </div>

            {renderArrayInput(t('admin.fields.tags'), 'tags')}

            <div className="mt-8 pt-8 border-t">
              <h3 className="text-lg font-bold mb-4 text-gray-400 uppercase tracking-widest text-xs">Entity Specific Fields</h3>
              
              {selectedEntity.category === 'items' && (
                <>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-bold mb-1">Item Type</label>
                      <select className="w-full p-2 border rounded bg-white" value={selectedEntity.type || ''} onChange={e => updateField('type', e.target.value)}>
                        <option value="weapon">Weapon</option>
                        <option value="armor">Armor</option>
                        <option value="consumable">Consumable</option>
                        <option value="material">Material</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-1">Rarity</label>
                      <select className="w-full p-2 border rounded bg-white" value={selectedEntity.rarity || ''} onChange={e => updateField('rarity', e.target.value)}>
                        <option value="common">Common</option>
                        <option value="uncommon">Uncommon</option>
                        <option value="rare">Rare</option>
                        <option value="epic">Epic</option>
                        <option value="legendary">Legendary</option>
                      </select>
                    </div>
                  </div>
                  {renderRelationSelect('Related Recipe', 'recipeId', 'recipes')}
                </>
              )}

              {(selectedEntity.category === 'mobs' || selectedEntity.category === 'npcs') && (
                renderRelationSelect(t('categories.locations'), 'locationId', 'locations')
              )}

              {selectedEntity.category === 'mobs' && (
                 renderArrayInput('Drops (Item IDs)', 'drops')
              )}

              {selectedEntity.category === 'quests' && (
                <>
                  {renderRelationSelect('Giver NPC', 'giverNpcId', 'npcs')}
                  {renderArrayInput('Rewards (Item IDs)', 'rewards')}
                </>
              )}

              {selectedEntity.category === 'recipes' && (
                <>
                  {renderRelationSelect(t('categories.items'), 'resultItemId', 'items')}
                  {renderRelationSelect(t('categories.npcs'), 'craftedByNpcId', 'npcs')}
                </>
              )}
            </div>

            <div className="mt-12 flex gap-4">
               <button 
                onClick={() => {
                  if (confirm('Delete this draft?')) {
                    const newDrafts = draftEntities.filter(e => e.id !== selectedEntity.id);
                    saveToLocal(newDrafts);
                    setSelectedEntity(null);
                  }
                }}
                className="bg-red-100 text-red-600 px-6 py-2 rounded-lg font-bold hover:bg-red-200"
              >
                {t('admin.delete')}
              </button>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-400">
            <div className="text-4xl mb-4">🛠️</div>
            <p>Select a draft or create a new one to start editing.</p>
          </div>
        )}
      </div>
    </div>
  );
}
