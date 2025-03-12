import "@components/css/mde-file.scss";

import MDEButton from "@components/MDEButton.jsx";
import IconLoader from "@components/IconLoader.jsx";
import {memo, useMemo, useState} from "react";
import {logger} from "@utils/Logger.js";
import {dragEnd} from "@utils/Listener.js";
import {handleDragLeave, handleDragOver} from "@utils/DragDropHandler.js";

/**
 * File component, used to display directory items
 *
 * @param {Object} props component attributes
 * @param {string} props.dirPath directory path
 * @param {string} props.name file name
 * @param {boolean} [props.showTwigs=true] show Twigs or not
 * @returns {React.ReactElement} rendered element
 */
const MDEFile = memo(({dirPath, name, showTwigs = true, ...props}) => {
    const fullPath = useMemo(() => dirPath + "\\" + name, [dirPath, name]);
    const [isDragOver, setIsDragOver] = useState(false);

    // Handle drag start event
    const handleDragStart = (e) => {
        // Set drag data
        e.dataTransfer.setData("text/plain", fullPath);
        e.dataTransfer.setData("application/json", JSON.stringify({
            type: "file",
            path: fullPath
        }));
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.dropEffect = "move";

        dragEnd(e, dirPath, fullPath);
    };

    // Handle drop event
    const handleDrop = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);

        try {
            // Get source path and type
            const sourcePath = e.dataTransfer.getData("text/plain");
            const sourceData = JSON.parse(e.dataTransfer.getData("application/json"));
            logger.info("[File][HandleDrop]", sourcePath, "->", dirPath);

            // If source and target are the same, do not perform operation
            if (sourcePath === fullPath) {
                return;
            }

            // Get source directory path
            const sourceDir = sourcePath.substring(0, sourcePath.lastIndexOf("\\"));
            // If source directory is the same as target directory, cancel operation
            if (sourceDir === dirPath) {
                return;
            }

            // Get target path (directory where the file is located)
            const targetDir = dirPath;

            // Path validation to prevent circular movement
            if (sourceData.type === "directory" && targetDir.startsWith(sourcePath + "\\")) {
                logger.warn("[File][HandleDrop] Cannot move to its own subdirectory");
                return;
            }

            const result = await window.explorer.moveFileOrFolder(sourcePath, targetDir);

            if (!result.success) {
                logger.warn("Move failed:", result.error);
            }

        } catch (error) {
            logger.error("Error handling drag and drop operation:", error);
        }
    };

    return (
        <div className={`mde-file`}
             {...props}>
            {showTwigs && <IconLoader name="twig" className="twig"/>}
            {showTwigs && <div className="trunk"></div>}
            <MDEButton
                className={`${isDragOver ? "drag-over" : ""}`}
                icon={<IconLoader name="file"/>}
                text={name}
                draggable={true}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}/>
        </div>
    );
});

export default MDEFile;
