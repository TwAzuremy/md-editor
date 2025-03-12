// noinspection JSIgnoredPromiseFromCall

import {app, BrowserWindow, ipcMain, screen, shell, dialog} from "electron";
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
    const windowBounds = store.get("md-editor.window-bounds");

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

    ipcMain.handle("electron-store", (_, operation, key, value) => {
        switch (operation) {
            case "get":
                // noinspection JSUnresolvedReference
                return store.get(key);
            case "set":
                // noinspection JSUnresolvedReference
                store.set(key, value);
                return true;
            case "del":
                // noinspection JSUnresolvedReference
                store.delete(key);
                return true;
            case "clr":
                // noinspection JSUnresolvedReference
                store.clear();
                return true;
        }
    });

    ipcMain.handle("check-path-exists", (_, dirPath) => {
        if (!dirPath) {
            return false;
        }

        try {
            return fs.existsSync(dirPath);
        } catch (error) {
            return false;
        }
    });

    ipcMain.handle("read-directory", async (_, dirPath, showHiddenFiles = false) => {
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
                        b.name, void 0,
                        // Turn on natural sorting of numbers, regardless of case sensitivity
                        {
                            numeric: true,
                            sensitivity: "base"
                        }
                    );
                });
        } catch (error) {
            return null;
        }
    });

    ipcMain.handle("open-directory-dialog", async () => {
        const result = await dialog.showOpenDialog({
            properties: ["openDirectory"]
        });

        if (!result.canceled && result.filePaths.length > 0) {
            const fullPath = result.filePaths[0];

            return {
                path: fullPath,
                name: path.basename(fullPath)
            };
        }
    });

    ipcMain.handle("open-in-system-explorer", async (_, dirPath) => {
        if (!dirPath) {
            return false;
        }

        try {
            await shell.openPath(dirPath);

            return true;
        } catch (error) {
            return false;
        }
    });
    
    // Handle file/folder move operation
    ipcMain.handle("move-file-or-folder", async (_, sourcePath, destinationPath) => {
        if (!sourcePath || !destinationPath) {
            return { success: false, error: "无效的路径" };
        }

        try {
            // 检查源路径是否存在
            if (!fs.existsSync(sourcePath)) {
                return { success: false, error: "源文件或文件夹不存在" };
            }

            // 检查源路径和目标路径是否相同
            if (path.resolve(sourcePath) === path.resolve(destinationPath)) {
                return { success: false, error: "源路径和目标路径相同" };
            }

            // 检查目标路径是否是文件
            if (fs.existsSync(destinationPath) && !fs.statSync(destinationPath).isDirectory()) {
                return { success: false, error: "目标路径不是一个目录" };
            }

            // 确保目标目录存在
            if (!fs.existsSync(destinationPath)) {
                fs.mkdirSync(destinationPath, { recursive: true });
            }
            
            // 获取源文件/文件夹的基本名称
            const baseName = path.basename(sourcePath);
            // 创建包含文件/文件夹名称的完整目标路径
            const fullDestPath = path.join(destinationPath, baseName);
            
            // 检查目标是否已存在，如果存在则生成一个新名称
            let finalDestPath = fullDestPath;
            if (fs.existsSync(fullDestPath)) {
                // 生成一个新的不冲突的文件名
                const ext = path.extname(baseName);
                const nameWithoutExt = path.basename(baseName, ext);
                let counter = 1;
                
                do {
                    const newName = `${nameWithoutExt} (${counter})${ext}`;
                    finalDestPath = path.join(destinationPath, newName);
                    counter++;
                } while (fs.existsSync(finalDestPath));
            }
            
            // 尝试移动文件/文件夹
            try {
                // 首先尝试直接移动
                fs.renameSync(sourcePath, finalDestPath);
            } catch (moveError) {
                // 如果直接移动失败，尝试复制然后删除的方法
                if (fs.statSync(sourcePath).isDirectory()) {
                    // 对于目录，使用递归复制
                    fs.mkdirSync(finalDestPath, { recursive: true });
                    copyFolderRecursiveSync(sourcePath, path.dirname(finalDestPath));
                    fs.rmSync(sourcePath, { recursive: true, force: true });
                } else {
                    // 对于文件，使用简单复制
                    fs.copyFileSync(sourcePath, finalDestPath);
                    fs.unlinkSync(sourcePath);
                }
            }
            
            return { success: true, newPath: finalDestPath };
        } catch (error) {
            console.error("文件移动错误:", error);
            return { success: false, error: error.message };
        }
    });
    
    /**
     * Recursively copies a folder
     * @param {string} source - Source folder path
     * @param {string} target - Target folder path
     */
    function copyFolderRecursiveSync(source, target) {
        const targetFolder = path.join(target, path.basename(source));
        
        // Create target folder if it doesn't exist
        if (!fs.existsSync(targetFolder)) {
            fs.mkdirSync(targetFolder, { recursive: true });
        }
        
        // Copy all files and subfolders
        if (fs.lstatSync(source).isDirectory()) {
            const files = fs.readdirSync(source);
            files.forEach(file => {
                const curSource = path.join(source, file);
                if (fs.lstatSync(curSource).isDirectory()) {
                    copyFolderRecursiveSync(curSource, targetFolder);
                } else {
                    fs.copyFileSync(curSource, path.join(targetFolder, file));
                }
            });
        }
    }
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
    const attributes = fswin.getAttributesSync(join(dirPath, filename));

    return attributes.IS_HIDDEN;
}