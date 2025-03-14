import "@components/css/mde-explorer.scss";

import {useEffect, useState, useCallback, forwardRef, useImperativeHandle, useRef, memo} from "react";
import MDEFolder from "@components/MDEFolder.jsx";
import MDEFile from "@components/MDEFile.jsx";
import {logger} from "@utils/Logger.js";
import {handleDragOver, handleDragLeave, handleDrop} from "@utils/DragDropHandler.js";
import {useDispatch, useSelector} from "react-redux";
import {clearSelectedPath, selectSelectedFolder} from "@store/folderSlice.js";

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
    const watcherIdRef = useRef(null);

    const [fileList, setFileList] = useState([]);
    const [isDragOver, setIsDragOver] = useState(false);

    const dispatch = useDispatch();
    const taggedFolderPath = useSelector(selectSelectedFolder);

    const readDirectory = async (path) => {
        setFileList(await window.explorer.readDirectory(path, false));
    };

    const startWatcher = async () => {
        try {
            if (!dirPath) {
                return;
            }

            watcherIdRef.current = await window.explorer.watchFolder(dirPath);
            window.explorer.onWatchListeners(watcherIdRef.current, handleWatcherUpdate);
        } catch (error) {
            logger.error("[Explorer] watch failed: ", error);
        }
    };

    const handleWatcherUpdate = async () => {
        await readDirectory(dirPathRef.current);
    }

    const clearSelectedFolder = async () => {
        const isExits = await window.explorer.checkPathExists(taggedFolderPath);

        if (!isExits) {
            dispatch(clearSelectedPath());
        }
    }

    useEffect(() => {
        clearSelectedFolder();

        dirPathRef.current = dirPath;

        readDirectory(dirPath);
        startWatcher();

        return () => {
            if (watcherIdRef.current) {
                window.explorer.unwatchFolder(watcherIdRef.current);
                window.explorer.removeWatchListeners(watcherIdRef.current, handleWatcherUpdate);
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
        readDirectory(dirPathRef.current);
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