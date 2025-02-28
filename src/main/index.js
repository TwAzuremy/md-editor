import {app, shell, BrowserWindow, ipcMain, screen} from "electron";
import path, {join} from "path";
import {promises as fs} from "fs";
import Store from "electron-store";
import {electronApp, optimizer, is} from "@electron-toolkit/utils";
import icon from "../../resources/icon.png?asset";

let mainWindow;
const store = new Store();

function createWindow() {
    // Get the window bounds from the store or set default values
    const windowBounds = store.get("md-editor.windowBounds");

    // Get the work area size of the primary display
    const {width, height} = screen.getPrimaryDisplay().workAreaSize;

    // Calculate the default x and y coordinates for the window
    const defaultBounds = {
        width: 1280,
        height: 720,
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

    ipcMain.on("window-close", () => {
        mainWindow.close();
    });

    mainWindow.on("maximize", () => {
        mainWindow.webContents.send("maximize", true);
    });

    mainWindow.on("unmaximize", () => {
        mainWindow.webContents.send("maximize", false);
    });

    // Save window bounds
    mainWindow.on("resize", saveWindowBounds);
    mainWindow.on("move", saveWindowBounds);
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

// Gets the structure of the folder
async function readDirectory(dirPath) {
    const result = [];
    const queue = [{path: dirPath, children: result}];

    while (queue.length > 0) {
        const {path: currentDir, children} = queue.shift();

        try {
            const files = await fs.readdir(currentDir);

            for (const file of files) {
                const fullPath = path.join(currentDir, file);
                const stats = await fs.stat(fullPath);

                if (stats.isDirectory()) {
                    const folderData = {
                        name: file,
                        children: []
                    };
                    children.push(folderData);
                    queue.push({path: fullPath, children: folderData.children});
                } else {
                    children.push({name: file});
                }
            }
        } catch (err) {
            console.error("Read directory failed: ", err);
        }
    }

    return result;
}

// const testDir = await readDirectory("D:\\PSA\\HTML\\cssAnimation");
//
// console.log(JSON.stringify(testDir, null, 2));
