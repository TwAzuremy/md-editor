import {contextBridge, ipcRenderer} from "electron";
import {electronAPI} from "@electron-toolkit/preload";
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
            /**
             * Listen for maximize event from the main process.
             *
             * @param {function} callback - Function to be called with maximized state.
             */
            onMaximize: (callback) => ipcRenderer.on("maximize", (_, isMaximized) => callback(isMaximized)),

            /**
             * Check if the window is maximized.
             *
             * @returns {Promise<boolean>} - A promise that resolves to the maximized state.
             */
            isMaximized: () => ipcRenderer.invoke("window-is-maximized")
        });

        contextBridge.exposeInMainWorld("explorer", {
            /**
             * Check if a directory exists.
             *
             * @param {string} dirPath
             * @returns {Promise<boolean>}
             */
            checkPathExists: (dirPath) => ipcRenderer.invoke('check-path-exists', dirPath),
            /**
             * Read a directory.
             *
             * @param {string} dirPath
             * @param {boolean} showHiddenFiles
             * @returns {Promise<[{name: string, type: string}]>}
             */
            readDirectory: (dirPath, showHiddenFiles = false) => ipcRenderer.invoke("read-directory", dirPath, showHiddenFiles),
            /**
             * Open a directory dialog.
             *
             * @returns {Promise<{path: string, name: string}>}
             */
            openDirectoryDialog: () => ipcRenderer.invoke("open-directory-dialog")
        });
    } catch (error) {
        logger.error("Failed to expose Electron API in the renderer process: ", error);
    }
} else {
    window.electron = electronAPI;
    window.api = api;
    window.windowControls = {};
    window.explorer = {};
}
