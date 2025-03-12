import "@components/css/mde-file.scss";

import MDEButton from "@components/MDEButton.jsx";
import IconLoader from "@components/IconLoader.jsx";
import { memo, useMemo, useState } from "react";
import path from "path";

/**
 * File component, used to display directory items
 *
 * @param {Object} props component attributes
 * @param {string} props.dirPath directory path
 * @param {string} props.name file name
 * @param {boolean} [props.showTwigs=true] show Twigs or not
 * @returns {React.ReactElement} rendered element
 */
const MDEFile = memo(({ dirPath, name, showTwigs = true, ...props }) => {
    const fullPath = useMemo(() => dirPath + "\\" + name, [dirPath, name]);
    const [isDragOver, setIsDragOver] = useState(false);

    // Handle drag start event
    const handleDragStart = (e) => {
        console.log('MDEFile - handleDragStart', fullPath);
        // Set drag data
        e.dataTransfer.setData("text/plain", fullPath);
        e.dataTransfer.setData("application/json", JSON.stringify({
            type: "file",
            path: fullPath
        }));
        e.dataTransfer.effectAllowed = "move";
        // Prevent browser default drag behavior
        e.stopPropagation()
    };

    // Handle drag over event
    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();

        // Set drag effect
        e.dataTransfer.dropEffect = "move";
        setIsDragOver(true);
    };

    // Handle drag leave event
    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
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
            console.log('MDEFile - handleDrop', 'source:', sourcePath, 'target dir:', dirPath);

            // If source and target are the same, do not perform operation
            if (sourcePath === fullPath) {
                console.log('MDEFile - handleDrop - Source and target are the same, operation cancelled');
                return;
            }

            // Get source directory path
            const sourceDir = sourcePath.substring(0, sourcePath.lastIndexOf('\\'));
            // If source directory is the same as target directory, cancel operation
            if (sourceDir === dirPath) {
                console.log('MDEFile - handleDrop - Source and target directory are the same, operation cancelled');
                return;
            }

            // Get target path (directory where the file is located)
            const targetDir = dirPath;

            // Path validation to prevent circular movement
            if (sourceData.type === "directory" && targetDir.startsWith(sourcePath + "\\")) {
                console.error('Cannot move to its own subdirectory');
                return;
            }

            // Execute move operation
            console.log('MDEFile - Execute move operation', 'Source path:', sourcePath, 'Target path:', targetDir);

            const result = await window.explorer.moveFileOrFolder(sourcePath, targetDir);
            console.log('MDEFile - moveFileOrFolder result', result);

            if (!result.success) {
                console.error('Move failed:', result.error);
                // Here you can add user interface prompts, such as using a toast component
                return;
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

    return (
        <div className={`mde-file ${isDragOver ? "drag-over" : ""}`}
            {...props}
            draggable={true}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}>
            {showTwigs && <IconLoader name="twig" className="twig" />}
            {showTwigs && <div className="trunk"></div>}
            <MDEButton icon={<IconLoader name="file" />} text={name} />
        </div>
    );
});

export default MDEFile;
