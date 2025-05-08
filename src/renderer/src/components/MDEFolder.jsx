import "@components/css/mde-folder.scss";

import MDEButton from "@components/MDEButton.jsx";
import {useRef, useState, useCallback, memo, useMemo, useEffect} from "react";
import IconLoader from "@components/IconLoader.jsx";
import MDEFile from "@components/MDEFile.jsx";
import {logger} from "@utils/Logger.js";
import {dragEnd} from "@utils/Listener.js";
import {handleDragLeave, handleDragOver, handleDrop} from "@utils/DragDropHandler.js";
import {useDispatch, useSelector} from "react-redux";
import {selectExpandedFolders, selectSelectedFolder, setSelectedPath, toggleFolder} from "@store/folderSlice.js";

/**
 * folder component, used to display a folder and its contents
 *
 * @param {Object} props component properties
 * @param {string} props.dirPath path to folder
 * @param {string} props.name folder name
 * @param {boolean} [props.showTwigs=true] is show the twigs or not
 * @returns {React.ReactElement} rendered element
 */
const MDEFolder = memo(({
                            dirPath, name, showTwigs = true,
                            ...props
                        }) => {
    const [fileList, setFileList] = useState([]);
    const [isDragOver, setIsDragOver] = useState(false);

    const folderEl = useRef(null);
    const watcherIdRef = useRef(null);

    const fullPath = useMemo(() => dirPath + "\\" + name, [dirPath, name]);

    const dispatch = useDispatch();
    const expandedFolder = useSelector(selectExpandedFolders);
    const taggedFolderPath = useSelector(selectSelectedFolder);
    const hasActive = expandedFolder.includes(fullPath);

    /**
     * Get the contents of the folder.
     *
     * @returns {Promise<void>}
     */
    const handleFolderChange = async () => {
        dispatch(toggleFolder(fullPath));
        dispatch(setSelectedPath(fullPath));

        if (hasActive) {
            setFileList([]);

            // When the folder is closed, remove the listener.
            if (watcherIdRef.current) {
                await window.explorer.unwatchFolder(watcherIdRef.current);
                window.explorer.removeWatchListeners(watcherIdRef.current);
            }

            return;
        }

        await refreshFileList();
    };

    const refreshFileList = async () => {
        const list = await window.explorer.readDirectory(fullPath, false);
        setFileList(list);
    };

    async function refresh(id) {
        // Verify that the listener is current
        if (id === watcherIdRef.current) {
            await refreshFileList();
        }
    }

    const startWatcher = async () => {
        try {
            watcherIdRef.current = await window.explorer.watchFolder(fullPath);
            window.explorer.onWatchListeners(watcherIdRef.current, handleWatcherUpdate);
        } catch (error) {
            logger.error("[Folder] Watch failed:", error);
        }
    };

    const handleWatcherUpdate = async () => {
        await refresh(watcherIdRef.current);
    };

    useEffect(() => {
        if (hasActive) {
            refreshFileList();
        }
    }, []);

    useEffect(() => {

        // When the folder is opened, the listener is initiated.
        if (hasActive) {
            startWatcher();
        }

        // Morph the folder icon
        morph();

        return () => {
            // When the component is unmounted, remove the folder listener and IPC listener
            if (watcherIdRef.current) {
                window.explorer.unwatchFolder(watcherIdRef.current);
                window.explorer.removeWatchListeners(watcherIdRef.current);
            }
        };
    }, [hasActive]);

    /**
     * Morphs the folder icon.
     *
     * @private
     */
    const morph = useCallback(async () => {
        try {
            const svg = folderEl.current.querySelector("&>.mde-button svg");
            const folder = svg.querySelector(".folder");
            const white = svg.querySelector(".white");

            const state = hasActive ? "Open" : "Close";

            folder.setAttribute("d", svg.dataset[`folder${state}`]);
            white.setAttribute("d", svg.dataset[`white${state}`]);
        } catch (error) {
            // The icon can't be found on the first load, which is normal.
            void 0;
        }
    }, [hasActive]);

    // Handle drag start events
    const handleDragStart = (e) => {
        // Set drag data
        e.dataTransfer.setData("text/plain", fullPath);
        e.dataTransfer.setData("application/json", JSON.stringify({
            type: "directory",
            path: fullPath
        }));

        e.dataTransfer.effectAllowed = "move";
        dragEnd(e, dirPath, fullPath);
    };

    const renderFileItem = useCallback((file, index) => {
        const key = file.name + file.type + index;
        const commonProps = {
            // Using fullPath as dirPath for child components is correct
            dirPath: fullPath,
            name: file.name,
            // Pass all drag-related props to ensure nested subdirectories also support dragging correctly
            ...props
        };

        if (file.type === "directory") {
            return <MDEFolder key={key} {...commonProps} />;
        } else if (file.type === "file") {
            return <MDEFile key={key} {...commonProps} />;
        }

        return null;
    }, [fullPath, props]);

    return (
        <div className={`mde-folder${hasActive ? " active" : ""}`} {...props} ref={folderEl}>
            {showTwigs && <IconLoader name={"twig"} className={"twig"}/>}
            {showTwigs && <div className={"trunk"}></div>}
            <MDEButton
                className={`${isDragOver ? "drag-over" : ""}`}
                icon={<IconLoader name={"folder"}/>}
                text={name}
                active={taggedFolderPath === fullPath}
                onClick={handleFolderChange}
                draggable={true}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, fullPath, setIsDragOver)}/>
            {
                fileList?.length !== 0 &&
                <div className={"mde-folder__file-list"}>
                    {fileList?.map((file, index) => renderFileItem(file, index))}
                </div>
            }
        </div>
    );
});

export default MDEFolder;
