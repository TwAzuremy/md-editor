import "@components/css/mde-folder.scss";

import MDEButton from "@components/MDEButton.jsx";
import {useRef, useState, useCallback, memo, useEffect, useMemo} from "react";
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

    const folderEl = useRef(null);

    const {getTemp, setTemp} = useTemp();

    // Listen for temporary values.
    const getTaggedFolder = useMemo(() => getTemp("tagged-folder"), [getTemp]);
    useEffect(() => {
        folderEl.current.classList.toggle("active", getTaggedFolder === dirPath + "\\" + name);
    }, [getTaggedFolder, fileList]);

    const openAndCloseFolder = useCallback(async () => {
        const fullPath = dirPath + "\\" + name;
        setTemp("tagged-folder", fullPath);
        morph();

        if (fileList.length) {
            setFileList([]);

            return;
        }

        const list = await window.explorer.readDirectory(fullPath, false);
        setFileList(list);
    }, [dirPath, name, fileList]);

    const renderFileItem = useCallback((file, index) => {
        const key = file.name + file.type + index;
        const commonProps = {
            dirPath: dirPath + "\\" + name,
            name: file.name
        };

        if (file.type === "directory") {
            return <MDEFolder key={key} {...commonProps} />;
        } else if (file.type === "file") {
            return <MDEFile key={key} {...commonProps} />;
        }
        return null;
    }, [dirPath, name]);

    /**
     * Morphs the folder icon.
     *
     * @private
     */
    function morph() {
        const svg = folderEl.current.querySelector("&>.mde-button svg");
        const folder = svg.querySelector(".folder");
        const white = svg.querySelector(".white");

        const hasActive = folderEl.current.classList.contains("active");
        folderEl.current.classList.toggle("active", !hasActive);
        const state = !hasActive ? "Open" : "Close";

        folder.setAttribute("d", svg.dataset[`folder${state}`]);
        white.setAttribute("d", svg.dataset[`white${state}`]);
    }

    return (
        <div className={"mde-folder"} {...props} ref={folderEl}>
            {showTwigs && <IconLoader name={"twig"} className={"twig"}/>}
            {showTwigs && <div className={"trunk"}></div>}
            <MDEButton icon={<IconLoader name={"folder"}/>} text={name} onClick={openAndCloseFolder}/>
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