import { contextBridge, ipcRenderer } from "electron";
import { electronAPI } from "@electron-toolkit/preload";

// Custom APIs for renderer
const api = {};

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
    try {
        contextBridge.exposeInMainWorld("electron", electronAPI);
        contextBridge.exposeInMainWorld("api", api);

        contextBridge.exposeInMainWorld("windowControls", {
            send: (msg) => ipcRenderer.send(msg),
            onMaximize: (callback) => ipcRenderer.on("maximize", (_, isFullScreen) => callback(isFullScreen)),
            removeAllListeners: (msg) => ipcRenderer.removeAllListeners(msg)
        });
    } catch (error) {
        console.error(error);
    }
} else {
    window.electron = electronAPI;
    window.api = api;
    window.windowControls = {};
}
