import "@components/css/mde-explorer.scss";

import {useEffect, useState, useCallback, forwardRef, useImperativeHandle, useRef, memo} from "react";
import MDEFolder from "@components/MDEFolder.jsx";
import MDEFile from "@components/MDEFile.jsx";
import {useTemp} from "@renderer/provider/TempProvider.jsx";

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

    const {setTemp} = useTemp();

    const readDirectory = useCallback(async (path) => {
        return await window.explorer.readDirectory(path, false);
    }, []);

    useEffect(() => {
        if (!dirPath) {
            return;
        }

        readDirectory(dirPath).then(list => setFileList(list || []));

        // Add refresh-explorer event listener
        const handleRefresh = (event) => {
            // Check if the event has a specific path to refresh
            const refreshPath = event.detail?.path;
            
            // If a specific path is provided and it's not the current directory, ignore it
            if (refreshPath && refreshPath !== dirPath) {
                return;
            }
            
            readDirectory(dirPath).then(list => setFileList(list || []));
        };
        window.addEventListener('refresh-explorer', handleRefresh);

        return () => {
            window.removeEventListener('refresh-explorer', handleRefresh);
        };
    }, [dirPath, readDirectory]);

    useEffect(() => {
        setTemp("tagged-folder", void 0);

        dirPathRef.current = dirPath;
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
        readDirectory(dirPathRef.current).then(list => setFileList(list || []));
    }

    // Export functions
    useImperativeHandle(ref, () => ({
        refresh
    }));

    return (
        <div className="mde-explorer">
            {fileList.map((file, index) => renderFileItem(file, index))}
        </div>
    );
}));

export default MDEExplorer;