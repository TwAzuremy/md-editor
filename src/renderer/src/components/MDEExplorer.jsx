import "@components/css/mde-explorer.scss";

import {useEffect, useState} from "react";
import MDEFolder from "@components/MDEFolder.jsx";
import MDEFile from "@components/MDEFile.jsx";

function MDEExplorer({dirPath = null}) {
    const [fileList, setFileList] = useState([]);

    async function readDirectory(dirPath) {
        return await window.explorer.readDirectory(dirPath, false);
    }

    useEffect(() => {
        if (!dirPath) {
            return;
        }

        readDirectory(dirPath).then(list => setFileList(list || []));
    }, [dirPath]);

    function renderFileItem(file, index) {
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
    }

    return (
        <div className={"mde-explorer"}>
            {fileList.map((file, index) => renderFileItem(file, index))}
        </div>
    );
}

export default MDEExplorer;