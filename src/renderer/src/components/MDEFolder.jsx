import "@components/css/mde-folder.scss";

import MDEButton from "@components/MDEButton.jsx";
import {useRef, useState} from "react";
import IconLoader from "@components/IconLoader.jsx";
import MDEFile from "@components/MDEFile.jsx";

function MDEFolder({dirPath, name, showTwigs = true, ...props}) {
    const [fileList, setFileList] = useState([]);

    const folderEl = useRef(null);

    async function openAndCloseFolder() {
        if (fileList.length) {
            setFileList([]);
            morph(false);

            return;
        }

        const fullPath = dirPath + "\\" + name;

        const list = await window.explorer.readDirectory(fullPath, false);

        setFileList(list);
        morph(true);
    }

    function renderFileItem(file, index) {
        const key = file.name + file.type + index;
        const commonProps = {
            dirPath: dirPath + "\\" + name,
            name: file.name
        };

        if (file.type === "directory") {
            return <MDEFolder key={key} {...commonProps}/>;
        } else if (file.type === "file") {
            return <MDEFile key={key} {...commonProps}/>;
        }
    }

    /**
     * Morphs the folder icon.
     *
     * @param {boolean} isOpen If the folder is open.
     *
     * @private
     */
    function morph(isOpen) {
        const svg = folderEl.current.querySelector("&>.mde-button svg");
        const folder = svg.querySelector(".folder");
        const white = svg.querySelector(".white");

        const state = isOpen ? 'Open' : 'Close';

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
}

export default MDEFolder;