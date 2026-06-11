import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Entity } from "../../../shared/types/entities";
import { STORAGE_KEY } from "../lib/constants";

export const useWikiEditor = () => {
  const queryClient = useQueryClient();
  const [dirHandle, setDirHandle] = useState<FileSystemDirectoryHandle | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);

  const getDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open("WikiEditorDB", 1);
      request.onupgradeneeded = () => request.result.createObjectStore("handles");
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  };

  useEffect(() => {
    const restoreHandle = async () => {
      try {
        const db = await getDB();
        const tx = db.transaction("handles", "readonly");
        const handle = await new Promise<FileSystemDirectoryHandle | undefined>((res) => {
          const req = tx.objectStore("handles").get("publicFolder");
          req.onsuccess = () => res(req.result);
        });

        if (handle) {
          setDirHandle(handle);
          if ((await handle.queryPermission({ mode: "readwrite" })) === "granted") {
            setIsAuthorized(true);
          }
        }
      } catch (e) {
        console.warn("Could not restore folder handle", e);
      }
    };
    restoreHandle();
  }, []);

  const connectToFolder = async () => {
    try {
      const handle = await window.showDirectoryPicker();
      if (!handle) return;

      if ((await handle.queryPermission({ mode: "readwrite" })) !== "granted") {
        await handle.requestPermission({ mode: "readwrite" });
      }

      if ((await handle.queryPermission({ mode: "readwrite" })) === "granted") {
        const db = await getDB();
        const tx = db.transaction("handles", "readwrite");
        tx.objectStore("handles").put(handle, "publicFolder");
        setDirHandle(handle);
        setIsAuthorized(true);
      }
    } catch (err) {
      console.error(err);
      alert("Connection failed or access denied");
    }
  };

  const saveToFiles = async (
    draftEntities: Entity[],
    deletedIds: string[],
    dbEntities: Entity[],
    onSuccess: () => void
  ) => {
    if (!dirHandle) return;
    try {
      const dataDir = await dirHandle.getDirectoryHandle("data");
      const groups: Record<string, Entity[]> = {};
      draftEntities.forEach((e) => {
        if (!groups[e.category]) groups[e.category] = [];
        groups[e.category].push(e);
      });

      const deletionsByCategory: Record<string, string[]> = {};
      deletedIds.forEach((id) => {
        const entity = dbEntities.find((e) => e.id === id);
        if (entity) {
          if (!deletionsByCategory[entity.category])
            deletionsByCategory[entity.category] = [];
          deletionsByCategory[entity.category].push(id);
        }
      });

      const allCats = new Set([...Object.keys(groups), ...Object.keys(deletionsByCategory)]);

      for (const cat of allCats) {
        let existingData: Entity[] = [];
        try {
          const handle = await dataDir.getFileHandle(`${cat}.json`);
          const file = await handle.getFile();
          const text = await file.text();
          if (text.trim()) existingData = JSON.parse(text) as Entity[];
        } catch {
          // File doesn't exist yet
        }

        const currentDeletions = deletionsByCategory[cat] || [];
        const filtered = existingData.filter((e) => !currentDeletions.includes(e.id));

        const updated = [...filtered];
        (groups[cat] || []).forEach((e) => {
          const idx = updated.findIndex((ex) => ex.id === e.id);
          if (idx > -1) updated[idx] = e;
          else updated.push(e);
        });

        const writeHandle = await dataDir.getFileHandle(`${cat}.json`, { create: true });
        const writable = await writeHandle.createWritable();
        await writable.write(JSON.stringify(updated, null, 2));
        await writable.close();
      }

      localStorage.removeItem(STORAGE_KEY);
      await queryClient.invalidateQueries({ queryKey: ["entities"] });
      onSuccess();
      setTimeout(() => alert("Saved!"), 100);
    } catch (err) {
      alert(err instanceof Error ? err.message : String(err));
    }
  };

  const uploadImage = async (
    file: File,
    entityCategory: string,
    entitySlug: string,
    onSuccess: (path: string) => void
  ) => {
    if (!dirHandle) return;
    try {
      const imgDir = await dirHandle.getDirectoryHandle("images", { create: true });
      const ext = file.name.split(".").pop();
      const fileName = `${entityCategory}_${entitySlug}_${Date.now()}.${ext}`;
      const fileHandle = await imgDir.getFileHandle(fileName, { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(file);
      await writable.close();
      onSuccess(`/images/${fileName}`);
    } catch (err) {
      console.error(err);
      alert("Failed to upload image");
    }
  };

  return {
    dirHandle,
    isAuthorized,
    connectToFolder,
    saveToFiles,
    uploadImage,
  };
};
