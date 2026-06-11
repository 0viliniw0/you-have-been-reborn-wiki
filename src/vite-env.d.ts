/// <reference types="vite/client" />

interface FileSystemHandle {
  queryPermission(descriptor?: { mode: "read" | "readwrite" }): Promise<PermissionState>;
  requestPermission(descriptor?: { mode: "read" | "readwrite" }): Promise<PermissionState>;
}

interface Window {
  showDirectoryPicker(options?: {
    mode?: "read" | "readwrite";
    startIn?: "desktop" | "documents" | "downloads" | "music" | "pictures" | "videos" | FileSystemHandle;
  }): Promise<FileSystemDirectoryHandle>;
}
