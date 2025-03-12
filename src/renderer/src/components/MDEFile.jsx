import "@components/css/mde-file.scss";

import MDEButton from "@components/MDEButton.jsx";
import IconLoader from "@components/IconLoader.jsx";
import {memo, useMemo, useState} from "react";
import {logger} from "@utils/Logger.js";
import {dragEnd} from "@utils/Listener.js";
import {handleDragOver, handleDragLeave, handleDrop} from "@utils/DragDropHandler.js";

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

    return (
        <div className={`mde-file ${isDragOver ? "drag-over" : ""}`}
            {...props}
            draggable={true}
            onDragStart={handleDragStart}
            onDragOver={(e) => handleDragOver(e, setIsDragOver)}
            onDragLeave={(e) => handleDragLeave(e, setIsDragOver)}
            onDrop={(e) => handleDrop(e, dirPath, setIsDragOver)}>
            <MDEButton
                className={"mde-file__button"}
                icon={<IconLoader name={"file"}/>}
                text={name}/>
            {showTwigs && <IconLoader name="twig" className="twig" />}
            {showTwigs && <div className="trunk"></div>}
        </div>
    );
});

export default MDEFile;
