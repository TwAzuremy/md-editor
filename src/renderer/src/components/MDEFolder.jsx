import "@components/css/mde-folder.scss";

import MDEButton from "@components/MDEButton.jsx";
import {useRef, useState, useCallback, memo, useMemo, useEffect} from "react";
import IconLoader from "@components/IconLoader.jsx";
import MDEFile from "@components/MDEFile.jsx";
import {useTemp} from "@renderer/provider/TempProvider.jsx";

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
    const [hasActive, setHasActive] = useState(false);
    const fullPath = useMemo(() => dirPath + "\\" + name, [dirPath, name]);

    const folderEl = useRef(null);
    const watcherIdRef = useRef(null);

    const {getTemp, setTemp} = useTemp();

    // Listen for temporary values.
    const taggedFolderPath = useMemo(() => getTemp("tagged-folder"), [getTemp]);

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
        setTemp("tagged-folder", fullPath);
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
                setTemp("tagged-folder", void 0);
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

    const renderFileItem = useCallback((file, index) => {
        const key = file.name + file.type + index;
        const commonProps = {
            dirPath: fullPath,
            name: file.name
        };

        if (file.type === "directory") {
            return <MDEFolder key={key} {...commonProps} />;
        } else if (file.type === "file") {
            return <MDEFile key={key} {...commonProps} />;
        }
    }, [fullPath]);

    return (
        <div className={`mde-folder ${hasActive ? "active" : ""}`} {...props} ref={folderEl}>
            {showTwigs && <IconLoader name={"twig"} className={"twig"}/>}
            {showTwigs && <div className={"trunk"}></div>}
            <MDEButton
                icon={<IconLoader name={"folder"}/>}
                text={name}
                active={taggedFolderPath === fullPath}
                onClick={openAndCloseFolder}/>
            {
                fileList && fileList.length !== 0 &&
                <div className={"mde-folder__file-list"}>
                    {fileList.map((file, index) => renderFileItem(file, index))}
                </div>
            }
        </div>
    );
});

export default MDEFolder;