import "@components/css/mde-explorer.scss";

import {useEffect, useState, useCallback, memo} from "react";
import MDEFolder from "@components/MDEFolder.jsx";
import MDEFile from "@components/MDEFile.jsx";

/**
 * The file browser component is used to display the contents of the directory
 * 
 * @param {Object} props component attributes
 * @param {string|null} props.dirPath directory path
 * @returns {React.ReactElement} renderer element
 */
const MDEExplorer = memo(function MDEExplorer({dirPath = null}) {
    const [fileList, setFileList] = useState([]);

    const readDirectory = useCallback(async (path) => {
        return await window.explorer.readDirectory(path, false);
    }, []);

    useEffect(() => {
        if (!dirPath) {
            return;
        }

        readDirectory(dirPath).then(list => setFileList(list || []));
    }, [dirPath, readDirectory]);

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
        return null;
    }, [dirPath]);

    return (
        <div className="mde-explorer">
            {fileList.map((file, index) => renderFileItem(file, index))}
        </div>
    );
});

export default MDEExplorer;