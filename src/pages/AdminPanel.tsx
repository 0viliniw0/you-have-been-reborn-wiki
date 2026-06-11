import { useQuery } from "@tanstack/react-query";
import { loadAllEntities } from "../shared/api/dataService";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { useWikiEditor } from "../features/admin/hooks/useWikiEditor";
import { useEntityDrafts } from "../features/admin/hooks/useEntityDrafts";
import { AdminSidebar } from "../widgets/AdminSidebar/ui/AdminSidebar";
import { EntityEditor } from "../widgets/EntityEditor/ui/EntityEditor";

export default function AdminPanel() {
  const { i18n } = useTranslation();
  const currentLang = i18n.language.split("-")[0] as "ru" | "en";

  const { data: dbEntities } = useQuery({
    queryKey: ["entities", "all"],
    queryFn: loadAllEntities,
  });

  const {
    isAuthorized,
    connectToFolder,
    saveToFiles,
    uploadImage,
  } = useWikiEditor();

  const {
    draftEntities,
    deletedIds,
    selectedEntityId,
    setSelectedEntityId,
    selectedEntity,
    allAvailableEntities,
    updateField,
    updateLocalizedField,
    createNewEntity,
    deleteEntity,
    resetState,
  } = useEntityDrafts(dbEntities);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedEntity) return;
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadImage(
      file,
      selectedEntity.category,
      selectedEntity.slug,
      (path) => updateField("image", path)
    );
  };

  const handleSave = () => {
    saveToFiles(draftEntities, deletedIds, dbEntities || [], resetState);
  };

  if (!isAuthorized)
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-blue-600/5 blur-[100px] rounded-full -translate-x-1/2 -translate-y-1/2"></div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full text-center space-y-12 relative z-10"
        >
          <div className="w-24 h-24 bg-blue-600 rounded-[2.5rem] flex items-center justify-center text-4xl font-black mx-auto shadow-2xl shadow-blue-500/50">
            W
          </div>
          <div>
            <h1 className="text-5xl font-black tracking-tighter mb-4">Content Editor</h1>
            <p className="text-slate-400 font-medium">
              Connect your local /public folder to start editing Wiki content directly from your
              browser.
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={connectToFolder}
            className="w-full py-6 px-8 bg-blue-600 rounded-[2rem] text-xl font-black shadow-xl shadow-blue-500/20"
          >
            📁 Unlock Workspace
          </motion.button>
        </motion.div>
      </div>
    );

  return (
    <div className="h-screen bg-slate-50 dark:bg-slate-950 flex overflow-hidden font-sans">
      <AdminSidebar
        allEntities={allAvailableEntities}
        draftEntities={draftEntities}
        deletedIds={deletedIds}
        selectedEntityId={selectedEntityId}
        setSelectedEntityId={setSelectedEntityId}
        createNewEntity={createNewEntity}
        handleSave={handleSave}
        currentLang={currentLang}
      />

      <div className="flex-1 flex flex-col bg-white dark:bg-slate-950 overflow-hidden relative">
        <AnimatePresence mode="wait">
          {selectedEntity ? (
            <EntityEditor
              selectedEntity={selectedEntity}
              allEntities={allAvailableEntities}
              currentLang={currentLang}
              updateField={updateField}
              updateLocalizedField={updateLocalizedField}
              uploadImage={handleImageUpload}
              deleteEntity={deleteEntity}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center opacity-20">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-900 rounded-2xl flex items-center justify-center text-2xl mb-4">
                📂
              </div>
              <h3 className="text-sm font-black uppercase tracking-widest italic">Select Entity</h3>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
