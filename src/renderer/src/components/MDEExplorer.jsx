import "@components/css/mde-explorer.scss";

import {useEffect, useState, useCallback, forwardRef, useImperativeHandle, useRef, memo} from "react";
import MDEFolder from "@components/MDEFolder.jsx";
import MDEFile from "@components/MDEFile.jsx";
import {useTemp} from "@renderer/provider/TempProvider.jsx";
import {logger} from "@utils/Logger.js";
import ElectronStore from "@utils/ElectronStore.js";
import {handleDragOver, handleDragLeave, handleDrop} from "@utils/DragDropHandler.js";

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
        const filename = isFile ? "New File.md" : "New Folder";

        let isSuccess = await window.explorer.createFile(dirPath || dirPathRef.current, filename, isFile);

        // If the path does not exist, create a new one in the workspace.
        if (isSuccess.code === 404) {
            isSuccess = await window.explorer.createFile(dirPathRef.current, filename, isFile);
        }

        if (isSuccess.success) {
            logger.info("[Explorer] File created successfully: " + isSuccess?.path);
        }
    }

    // Export functions
    useImperativeHandle(ref, () => ({
        refresh, createFile
    }));

    return (
        <div className={`mde-explorer ${isDragOver ? "drag-over" : ""}`}
             onDragOver={(e) => handleDragOver(e, setIsDragOver)}
             onDragLeave={(e) => handleDragLeave(e, setIsDragOver)}
             onDrop={(e) => handleDrop(e, dirPath, setIsDragOver)}>
            {fileList?.map((file, index) => renderFileItem(file, index))}
        </div>
    );
}));

export default MDEExplorer;