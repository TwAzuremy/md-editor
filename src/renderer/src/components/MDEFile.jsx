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
const MDEFile = memo(({dirPath, name, showTwigs = true, ...props}) => {
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
                console.log('MDEFile - handleDrop - 源与目标相同，取消操作');
                return;
            }

            // Get target path (directory where the file is located)
            const targetDir = dirPath;

            // Path validation to prevent circular movement
            if (sourceData.type === "directory" && targetDir.startsWith(sourcePath + "\\")) {
                console.error('Cannot move to its own subdirectory');
                return;
            }

            // Only output debug information, do not perform actual move operation
            console.log('MDEFile - 拖拽调试信息', '源路径:', sourcePath, '目标路径:', targetDir);
            
            // Commented out actual move operation
            // const result = await window.explorer.moveFileOrFolder(sourcePath, targetDir);
            // console.log('MDEFile - moveFileOrFolder结果', result);
            // 
            // if (!result.success) {
            //     console.error('Move failed:', result.error);
            //     // Here you can add user interface prompts, such as using a toast component
            //     return;
            // }
            
            // No longer trigger refresh event
            // window.dispatchEvent(new CustomEvent('refresh-explorer'));
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
            {showTwigs && <IconLoader name="twig" className="twig"/>}
            {showTwigs && <div className="trunk"></div>}
            <MDEButton icon={<IconLoader name="file"/>} text={name}/>
        </div>
    );
});

export default MDEFile;
