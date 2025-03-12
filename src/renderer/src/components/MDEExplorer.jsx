import "@components/css/mde-explorer.scss";

import {useEffect, useState, useCallback, forwardRef, useImperativeHandle, useRef, memo} from "react";
import MDEFolder from "@components/MDEFolder.jsx";
import MDEFile from "@components/MDEFile.jsx";
import {useTemp} from "@renderer/provider/TempProvider.jsx";
import {logger} from "@utils/Logger.js";
import ElectronStore from "@utils/ElectronStore.js";

/**
 * The file browser component is used to display the contents of the directory
 *
 * @function MDEExplorer
 *
 * @param {*} props component attributes
 * @param {string|null} dirPath directory path
 *
 * @returns {React.ReactElement} renderer element
 *
 * @example
 * <MDEExplorer dirPath={"D:\\Notes"}/>
 */
const MDEExplorer = memo(forwardRef(({dirPath = null}, ref) => {
    // The method used to give exposure is updated in real time with dirPath.
    const dirPathRef = useRef(dirPath);

    const [fileList, setFileList] = useState([]);
    const [isDragOver, setIsDragOver] = useState(false);

    const {setTemp} = useTemp();

    const readDirectory = async (path) => {
        return await window.explorer.readDirectory(path, false);
    };

    useEffect(() => {
        if (!dirPath) {
            return;
        }

        readDirectory(dirPath).then(list => setFileList(list || []));

        // Add refresh-explorer event listener
        const handleRefresh = (event) => {
            // Check if the event has a specific path to refresh
            const refreshPath = event.detail?.path;

            // If a specific path is provided, and it's not the current directory, ignore it
            if (refreshPath && refreshPath !== dirPath) {
                return;
            }

            readDirectory(dirPath).then(list => setFileList(list || []));
        };
        window.addEventListener("refresh-explorer", handleRefresh);

        return () => {
            window.removeEventListener("refresh-explorer", handleRefresh);
        };
    }, [dirPath, readDirectory]);

    useEffect(() => {
        setTemp(ElectronStore.KEY_TAGGED_FOLDER, void 0);

        dirPathRef.current = dirPath;

        let watcher;

        const startWatching = async () => {
            try {
                if (!dirPath) {
                    return;
                }

                watcher = await window.explorer.watchFolder(dirPath);
                window.explorer.onWatchUpdate(({watcherId: id}) => {
                    if (id === watcher.id) {
                        readDirectory();
                    }
                });
            } catch (error) {
                logger.error("[Explorer] watch failed: ", error);
            }
        };

        startWatching();

        return () => {
            if (watcher) {
                window.explorer.unwatchFolder(watcher);
                window.explorer.removeWatchListeners(({watcherId: id}) => {
                    if (id === watcher.id) {
                        readDirectory();
                    }
                });
            }
        };
    }, [dirPath]);

    const renderFileItem = useCallback((file, index) => {
        const key = file.name + file.type + index;
        const commonProps = {
            dirPath,
            name: file.name,
            showTwigs: false
        };

        if (file.type === "directory") {
            return <MDEFolder key={key} {...commonProps}/>;
        } else if (file.type === "file") {
            return <MDEFile key={key} {...commonProps}/>;
        }
    }, [dirPath]);

    /**
     * Refreshes the current directory listing by re-reading the directory.
     * Updates the file list state with the contents of the directory at the current path.
     */
    function refresh() {
        setFileList([]);
        readDirectory(dirPathRef.current).then(list => setFileList(list || []));
    }

    async function createFile(dirPath = void 0, isFile = false) {
        const isSuccess = await window.explorer.createFile(
            // TODO [BUG] When "dirPath" is empty, it does not switch to "dirPathRef.current", which is the path to the workspace.
            dirPath || dirPathRef.current,
            isFile ? "New File.md" : "New Folder",
            isFile
        );

        if (isSuccess) {
            logger.info("[Explorer] File created successfully: " + isSuccess);
        }
    }

    // Export functions
    useImperativeHandle(ref, () => ({
        refresh, createFile
    }));

    return (
        <div className={`mde-explorer ${isDragOver ? "drag-over" : ""}`}
             onDragOver={(e) => {
                 e.preventDefault();
                 e.stopPropagation();
                 e.dataTransfer.dropEffect = "move";
                 setIsDragOver(true);
             }}
             onDragLeave={(e) => {
                 e.preventDefault();
                 e.stopPropagation();
                 setIsDragOver(false);
             }}
             onDrop={async (e) => {
                 e.preventDefault();
                 e.stopPropagation();
                 setIsDragOver(false);

                 try {
                     const sourcePath = e.dataTransfer.getData("text/plain");
                     if (dirPath) {
                         const result = await window.explorer.moveFileOrFolder(sourcePath, dirPath);
                         if (!result.success) {
                             logger.warn("Move to workspace root failed:", result.error);
                         }
                     }
                 } catch (error) {
                     logger.error("Error handling drag and drop operation:", error);
                 }
             }}>
            {fileList.map((file, index) => renderFileItem(file, index))}
        </div>
    );
}));

export default MDEExplorer;