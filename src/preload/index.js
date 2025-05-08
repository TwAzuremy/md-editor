import {contextBridge, ipcRenderer} from "electron";
import {electronAPI} from "@electron-toolkit/preload";
import {logger} from "../utils/Logger.js";

// Custom APIs for renderer
const api = {};

/**
 * Save the folder update listener event
 *
 * @type {Map<String, Function>}
 */
const watchListeners = new Map();

/**
 * Handles watch update event from the main process.
 *
 * @param {string} id - Watcher ID from the main process.
 * @param {string} watcherId - Watcher ID to match against.
 * @param {function} [callback] - Optional callback function to be called if the watcher IDs match.
 */
function handleWatchUpdate(id, watcherId, callback) {
    if (id === watcherId) {
        callback?.();
    }
}

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
            onMaximize: (callback) =>
                ipcRenderer.on("maximize", (_, isMaximized) => callback(isMaximized)),

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
             * @param {string|null} dirPath
             * @returns {Promise<boolean>}
             */
            checkPathExists: (dirPath) => ipcRenderer.invoke("check-path-exists", dirPath),
            /**
             * Read a directory.
             *
             * @param {string|null} dirPath
             * @param {boolean} showHiddenFiles
             * @returns {Promise<[{name: string, type: string}]>}
             */
            readDirectory: (dirPath, showHiddenFiles = false) =>
                ipcRenderer.invoke("read-directory", dirPath, showHiddenFiles),
            /**
             * Open a directory dialog.
             *
             * @returns {Promise<{path: string, name: string}>}
             */
            openDirectoryDialog: () => ipcRenderer.invoke("open-directory-dialog"),
            /**
             * Open a directory in the system's file explorer.
             *
             * @param {string|null} dirPath - Path to the directory to open.
             * @returns {Promise<boolean>}
             */
            openInSystemExplorer: (dirPath) => ipcRenderer.invoke("open-in-system-explorer", dirPath),
            /**
             * Move a file or folder to a new location.
             *
             * @param {string} sourcePath - Path of the file or folder to move.
             * @param {string} destinationPath - Destination directory path.
             * @param {boolean} [isCopy=false] - If true, copy the file instead of moving it.
             * @returns {Promise<{success: boolean, newPath?: string, error?: string}>}
             */
            moveFileOrFolder: (sourcePath, destinationPath, isCopy = false) =>
                ipcRenderer.invoke("move-file-or-folder", sourcePath, destinationPath, isCopy),
            /**
             * Create a file or folder.
             *
             * @param {string|null} dirPath - Path to the directory to create the file or folder in.
             * @param {string} name - Name of the file or folder to create.
             * @param {boolean} [isFile=false] - If true, create a file; otherwise, create a folder.
             * @returns {Promise<boolean>} - A promise that resolves to true if the file or folder was created successfully.
             */
            createFile: (dirPath, name, isFile = false) =>
                ipcRenderer.invoke("create-file", dirPath, name, isFile),
            watchFolder: (dirPath) => ipcRenderer.invoke("watch-folder", dirPath),
            unwatchFolder: (watcherId) => ipcRenderer.invoke("unwatch-folder", watcherId),
            onWatchListeners: (watcherId, callback) => {
                if (watchListeners.has(watcherId)) {
                    ipcRenderer.removeListener("watch-folder-update", watchListeners.get(watcherId));
                }

                const handler = (_, {watcherId: id}) => handleWatchUpdate(id, watcherId, callback);
                watchListeners.set(watcherId, handler);

                ipcRenderer.on("watch-folder-update", handler);
            },
            removeWatchListeners: (watcherId) => {
                if (watchListeners.has(watcherId)) {
                    ipcRenderer.removeListener("watch-folder-update", watchListeners.get(watcherId));
                    watchListeners.delete(watcherId);
                }
            }
        });

        // noinspection JSUnresolvedReference
        contextBridge.exposeInMainWorld("store", {
            get: (key) => ipcRenderer.invoke("electron-store", "get", key, null),
            set: (key, value) => ipcRenderer.invoke("electron-store", "set", key, value),
            del: (key) => ipcRenderer.invoke("electron-store", "del", key, null),
            clr: () => ipcRenderer.invoke("electron-store", "clr", null, null)
        });
    } catch (error) {
        logger.error("Failed to expose Electron API in the renderer process: ", error);
    }
} else {
    window.electron = electronAPI;
    window.api = api;
    window.windowControls = {};
    window.explorer = {};
    window.store = {};
}
