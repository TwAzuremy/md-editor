import "@renderer/container/css/mde-file-manager.scss";

import MDEInput from "@components/MDEInput.jsx";
import IconLoader from "@components/IconLoader.jsx";

function MDEFileManager() {
    return (
        <div id={"mde-file-manager"}>
            <MDEInput
                type={"text"}
                placeholder={"Search Files"}
                icon={<IconLoader name={"search"}/>}/>
        </div>
    );
}

export default MDEFileManager;