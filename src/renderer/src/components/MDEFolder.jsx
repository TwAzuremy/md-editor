import "@components/css/mde-folder.scss";

import MDEButton from "@components/MDEButton.jsx";
import {useRef, useState, useCallback, memo, useMemo, useEffect} from "react";
import IconLoader from "@components/IconLoader.jsx";
import MDEFile from "@components/MDEFile.jsx";
import {useTemp} from "@renderer/provider/TempProvider.jsx";
import ElectronStore from "@utils/ElectronStore.js";

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
    dirPath,
    name,
    showTwigs = true,
    ...props
}) => {
    const [fileList, setFileList] = useState([]);
    const [isDragOver, setIsDragOver] = useState(false);
    const [hasActive, setHasActive] = useState(false);
    const fullPath = useMemo(() => dirPath + "\\" + name, [dirPath, name]);

    const folderEl = useRef(null);
    const watcherIdRef = useRef(null);

    const { getTemp, setTemp } = useTemp();

    // Listen for temporary values.
    const taggedFolderPath = useMemo(() => getTemp(ElectronStore.KEY_TAGGED_FOLDER), [getTemp]);

    /**
     * Get the contents of the folder.
     *
     * @param {boolean} [isForced=false] The isForced parameter is used to get content updates when the folder is open,
     * rather than closing the folder.
     * @returns {Promise<void>}
     */
    const handleFolderChange = async (isForced = false) => {
        if (hasActive && !isForced) {
            setFileList([]);
            if (watcherIdRef.current) {
                await window.explorer.unwatchFolder(watcherIdRef.current);
                window.explorer.removeWatchListeners(({watcherId: id}) => refresh(id));
            }

            return;
        }

        const list = await window.explorer.readDirectory(fullPath, false);
        setFileList(list);
    };

    const openAndCloseFolder = async () => {
        setTemp(ElectronStore.KEY_TAGGED_FOLDER, fullPath);
        morph();

        await handleFolderChange(false);
    };

    async function refresh(id) {
        // Verify that the listener is current
        if (id === watcherIdRef.current) {
            await handleFolderChange(true);
        }
    }

    useEffect(() => {
        const startWatching = async () => {
            try {
                watcherIdRef.current = await window.explorer.watchFolder(fullPath);
                window.explorer.onWatchUpdate(({watcherId: id}) => refresh(id));
            } catch (error) {
                console.error("Watch failed:", error);
            }
        };

        // When the folder is opened, the listener is initiated.
        if (hasActive) {
            startWatching();
        }

        return () => {
            // When the component is unmounted, remove the folder listener and IPC listener
            if (watcherIdRef.current) {
                window.explorer.unwatchFolder(watcherIdRef.current);
                window.explorer.removeWatchListeners(({watcherId: id}) => refresh(id));
            }

            // If a folder is deleted, and the folder is selected, its value in the temporary cache is removed.
            if (taggedFolderPath === fullPath) {
                setTemp(ElectronStore.KEY_TAGGED_FOLDER, void 0);
            }
        };
    }, [hasActive]);

    /**
     * Morphs the folder icon.
     *
     * @private
     */
    function morph() {
        const svg = folderEl.current.querySelector("&>.mde-button svg");
        const folder = svg.querySelector(".folder");
        const white = svg.querySelector(".white");

        setHasActive(!hasActive);
        const state = !hasActive ? "Open" : "Close";

        folder.setAttribute("d", svg.dataset[`folder${state}`]);
        white.setAttribute("d", svg.dataset[`white${state}`]);
    }

    // Handle drag start events
    const handleDragStart = (e) => {
        console.log('MDEFolder - handleDragStart', fullPath);
        // Set drag data
        e.dataTransfer.setData("text/plain", fullPath);
        e.dataTransfer.setData("application/json", JSON.stringify({
            type: "directory",
            path: fullPath
        }));
        e.dataTransfer.effectAllowed = "move";
        // Prevent event bubbling to avoid triggering drag events on parent folders
        e.stopPropagation();
    };

    // Handle drag over events
    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        e.dataTransfer.dropEffect = "move";
        setIsDragOver(true);
    };

    // Handle drag leave events
    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
    };

    // Handle drop events
    const handleDrop = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);

        try {
            // Get the source path and type
            const sourcePath = e.dataTransfer.getData("text/plain");
            const sourceData = JSON.parse(e.dataTransfer.getData("application/json"));

            // Output drag and drop debug information
            console.log('MDEFolder - Drag Debug Info', ':', sourcePath, ' -> ', fullPath);

            // Path validation to prevent circular movement
            if (sourceData.type === "directory" && sourcePath === fullPath) {
                console.error('Cannot move to itself');
                return;
            }

            // Check if attempting to move a folder to its own subdirectory
            if (sourceData.type === "directory" && fullPath.startsWith(sourcePath + "\\")) {
                console.error('Cannot move to its own subdirectory');
                return;
            }
            
            // Get source directory path
            const sourceDir = sourcePath.substring(0, sourcePath.lastIndexOf('\\'));
            
            // If source path and target path are the same, cancel operation
            if (sourceDir === fullPath) {
                console.log('MDEFolder - handleDrop - Source and target are the same, operation cancelled');
                return;
            }
            
            // Execute move operation
            const result = await window.explorer.moveFileOrFolder(sourcePath, fullPath);
            console.log('MDEFolder - moveFileOrFolder result', result);
            
            if (!result.success) {
                console.error('Move failed:', result.error);
                return;
            }

            // Clear and reload file list for affected folders
            setFileList([]);

            if (fileList.length > 0) {
                const list = await window.explorer.readDirectory(fullPath, false);
                setFileList(list);
            }
            
            // Trigger explorer refresh
            window.dispatchEvent(new CustomEvent('refresh-explorer'));
            
            // Also refresh the source directory to update the file tree
            if (sourceDir) {
                window.dispatchEvent(new CustomEvent('refresh-explorer', { detail: { path: sourceDir } }));
            }
        } catch (error) {
            console.error("Error handling drag and drop operation:", error);
        }
    };

    const renderFileItem = useCallback((file, index) => {
        const key = file.name + file.type + index;
        const commonProps = {
            dirPath: fullPath, // Using fullPath as dirPath for child components is correct
            name: file.name,
            // Ensure child items correctly inherit drag functionality
            draggable: true,
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
    <div className={`mde-folder ${isDragOver ? "drag-over" : ""} ${hasActive ? "active" : ""}`}
        {...props}
        ref={folderEl}
        draggable={true}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}>
        {showTwigs && <IconLoader name={"twig"} className={"twig"} />}
        {showTwigs && <div className={"trunk"}></div>}
        <MDEButton
            icon={<IconLoader name={"folder"} />}
            text={name}
            active={taggedFolderPath === fullPath}
            onClick={openAndCloseFolder} />
        {
            fileList.length !== 0 &&
            <div className={"mde-folder__file-list"}>
                {fileList.map((file, index) => renderFileItem(file, index))}
            </div>
        }
    </div>
);
});

export default MDEFolder;