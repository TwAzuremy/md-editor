// noinspection JSIgnoredPromiseFromCall

import {app, BrowserWindow, ipcMain, screen, shell} from "electron";
import {join} from "path";
import Store from "electron-store";
import {electronApp, is, optimizer} from "@electron-toolkit/utils";
import icon from "../../resources/icons/icon.png?asset";
import * as path from "node:path";

const fs = require("fs");

let mainWindow;
const store = new Store();

function createWindow() {
    // Get the window bounds from the store or set default values
    // noinspection JSUnresolvedReference
    const windowBounds = store.get("md-editor.windowBounds");

    // Get the work area size of the primary display
    const {width, height} = screen.getPrimaryDisplay().workAreaSize;

    // Calculate the default x and y coordinates for the window
    const defaultBounds = {
        width: 1280,
        height: 800,
        x: 0,
        y: 0
    };

    // The default value for the calculation is the center position.
    defaultBounds.x = (width - (windowBounds?.width || defaultBounds.width)) / 2;
    defaultBounds.y = (height - (windowBounds?.height || defaultBounds.height)) / 2;

    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: windowBounds?.width || defaultBounds.width,
        height: windowBounds?.height || defaultBounds.height,
        x: windowBounds?.x || defaultBounds.x,
        y: windowBounds?.y || defaultBounds.y,
        show: false,
        frame: false,
        autoHideMenuBar: true,
        icon: icon,
        ...(process.platform === "linux" ? {icon} : {}),
        webPreferences: {
            preload: join(__dirname, "../preload/index.mjs"),
            sandbox: false,
            nodeIntegration: false,
            contextIsolation: true
        }
    });

    mainWindow.on("ready-to-show", () => {
        mainWindow.show();
    });

    mainWindow.webContents.setWindowOpenHandler((details) => {
        shell.openExternal(details.url);
        return {action: "deny"};
    });

    // HMR for renderer base on electron-vite cli.
    // Load the remote URL for development or the local html file for production.
    if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
        mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
    } else {
        mainWindow.loadFile(join(__dirname, "../renderer/index.html"));
    }

    ipcMain.on("window-minimize", () => {
        mainWindow.minimize();
    });

    ipcMain.on("window-maximize", (_) => {
        mainWindow.isMaximized() ? mainWindow.unmaximize() : mainWindow.maximize();
    });

    mainWindow.on("maximize", () => {
        mainWindow.webContents.send("maximize", true);
    });

    mainWindow.on("unmaximize", () => {
        mainWindow.webContents.send("maximize", false);
    });

    ipcMain.handle("window-is-maximized", () => {
        return mainWindow.isMaximized();
    });

    ipcMain.on("window-close", () => {
        mainWindow.close();
    });

    // Save window bounds
    mainWindow.on("resize", saveWindowBounds);
    mainWindow.on("move", saveWindowBounds);

    ipcMain.handle("read-directory", (_, dirPath, showHiddenFiles = false) => {
        try {
            const directs = fs.readdirSync(dirPath, {withFileTypes: true});

            return directs
                .filter(dirent => {
                    const isDirOrFile = dirent.isDirectory() || dirent.isFile();
                    if (!isDirOrFile) return false;

                    return showHiddenFiles || !checkFileIsHidden(dirPath, dirent.name);
                })
                .map(dirent => ({
                    name: dirent.name,
                    type: dirent.isDirectory() ? "directory" : "file"
                }))
                .sort((a, b) => {
                    // Sort by type: folders first
                    if (a.type !== b.type) {
                        return a.type === "directory" ? -1 : 1;
                    }

                    // If the type is the same, sort by name
                    return a.name.localeCompare(
                        b.name,
                        void 0,
                        // Turn on natural sorting of numbers, regardless of case sensitivity
                        {
                            numeric: true,
                            sensitivity: "base"
                        }
                    );
                });
        } catch (error) {
            throw new Error(`Directory read failed: ${error.message}`);
        }
    });
}

/**
 * Save the window bounds to the store.
 *
 * This function checks if the main window exists and retrieves its bounds.
 * If the main window exists, the bounds are stored in the store under the key "md-editor.windowBounds".
 */
function saveWindowBounds() {
    // Check if the main window exists
    if (mainWindow) {
        // Get the bounds of the main window
        const bounds = mainWindow.getBounds();

        // Store the bounds in the store
        // noinspection JSUnresolvedReference
        store.set("md-editor.windowBounds", bounds);
    }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
    // Set app user model id for windows
    electronApp.setAppUserModelId("com.electron");

    // Default open or close DevTools by F12 in development
    // and ignore CommandOrControl + R in production.
    // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
    app.on("browser-window-created", (_, window) => {
        optimizer.watchWindowShortcuts(window);
    });

    // IPC test
    ipcMain.on("ping", () => console.log("pong"));

    createWindow();

    app.on("activate", function () {
        // On MACOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

/**
 * Checks if a file is hidden.
 *
 * This function determines whether a given file is hidden based on the operating system platform.
 * - On Unix-like systems (e.g., macOS or Linux), files starting with a dot (.) are considered hidden.
 * - On Windows, the `fswin` module is used to check the file attributes to determine if it is hidden.
 *
 * @function checkFileIsHidden
 *
 * @param {string} dirPath - The directory path where the file is located.
 * @param {string} filename - The name of the file to check.
 *
 * @returns {boolean} Returns `true` if the file is hidden, otherwise `false`.
 *
 * @throws {Error} If reading file attributes fails on Windows, an error will be thrown.
 *
 * @example
 * // Example for Unix-like systems
 * console.log(checkFileIsHidden('/path/to/directory', '.hiddenFile'));  // true
 * console.log(checkFileIsHidden('/path/to/directory', 'visibleFile'));  // false
 *
 * @example
 * // Example for Windows systems
 * console.log(checkFileIsHidden('C:\\path\\to\\directory', 'hiddenFile.txt'));
 */
function checkFileIsHidden(dirPath, filename) {
    // Unix
    if (process.platform !== "win32") {
        return /(^|\/)\.[^\/.]/g.test(filename);
    }

    // Windows
    const fswin = require("fswin");
    const attributes = fswin.getAttributesSync(path.join(dirPath, filename));

    return attributes.IS_HIDDEN;
}