import "@renderer/container/css/mde-file-manager.scss";

import MDEInput from "@components/MDEInput.jsx";
import IconLoader from "@components/IconLoader.jsx";
import MDEPopover from "@components/MDEPopover.jsx";

function MDEFileManager() {
    return (
        <div id={"mde-file-manager"}>
            <MDEInput
                type={"text"}
                placeholder={"Search Files"}
                icon={<IconLoader name={"search"}/>}/>
            <MDEPopover direction={"right"} nearEdge={"top"}>
                <div className={"workspace"} slot={"default"}>
                    {/* TODO [TEST] Placeholders, after reading the workspace name is placed here. */}
                    <p className={"workspace__name"}>Workspace Name</p>
                    <IconLoader name={"chevron-right"}/>
                </div>
                <div className={"workspace__history"} slot={"floating"}>
                    {/* TODO [TEST] Placeholders, which are used to place the history of the open workspace. */}
                    Hello World
                </div>
            </MDEPopover>
        </div>
    );
}

export default MDEFileManager;