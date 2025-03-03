import { contextBridge, ipcRenderer } from "electron";
import { electronAPI } from "@electron-toolkit/preload";
import {logger} from "../utils/Logger.js";

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
            onMaximize: (callback) => ipcRenderer.on("maximize", (_, isMaximized) => callback(isMaximized)),
            isMaximized: () => ipcRenderer.invoke('window-is-maximized')
        });
    } catch (error) {
        logger.error("Failed to expose Electron API in the renderer process: ", error);
    }
} else {
    window.electron = electronAPI;
    window.api = api;
    window.windowControls = {};
}
