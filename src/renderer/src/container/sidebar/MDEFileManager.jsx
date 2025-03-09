import "@renderer/container/css/mde-file-manager.scss";

import MDEInput from "@components/MDEInput.jsx";
import IconLoader from "@components/IconLoader.jsx";
import MDEPopover from "@components/MDEPopover.jsx";
import MDEButton from "@components/MDEButton.jsx";
import {useState} from "react";
import MDEExplorer from "@components/MDEExplorer.jsx";

/**
 * Use this when you don't have a workspace
 *
 * @type {{name: string, path: string|null}}
 */
const NO_WORKSPACE = {
    name: "No open workspace",
    path: null
};

// TODO: [TEST] Simulate the data of the workspace.
const recent = [
    {
        name: "HTML Projects",
        path: "D:\\PSA\\HTML"
    },
    {
        name: "Kotlin Projects",
        path: "D:\\PSA\\Kotlin"
    },
    {
        name: "Notes",
        path: "D:\\Typora\\Notes"
    },
    {
        name: "Not Exist",
        path: "D:\\ThePathIsNotExist"
    }
];

function MDEFileManager() {
    const [currentWorkspace, setCurrentWorkspace] = useState(NO_WORKSPACE);

    async function switchWorkspace(workspace) {
        const isExits = await window.explorer.checkPathExists(workspace.path);

        if (isExits) {
            setCurrentWorkspace(workspace);
        }
    }

    async function openDirectoryDialog() {
        const workspace = await window.explorer.openDirectoryDialog();

        // After clicking Cancel, the return value is "undefined"
        if (!workspace) {
            return;
        }

        setCurrentWorkspace(workspace);
    }

    return (
        <div id={"mde-file-manager"}>
            <MDEInput
                type={"text"}
                placeholder={"Search Files"}
                icon={<IconLoader name={"search"}/>}/>
            <MDEPopover direction={"right"} nearEdge={"top"}>
                <div className={"workspace"} slot={"default"}>
                    <p className={"workspace__name"}>{currentWorkspace?.name}</p>
                    <IconLoader name={"chevron-right"}/>
                </div>
                <div className={"workspace__recent"} slot={"floating"}>
                    <h5 className={"workspace__recent__title"}>Current</h5>
                    <MDEButton
                        text={
                            <>
                                <span className={"workspace__name"}>{currentWorkspace.name}</span>
                                <span className={"workspace__path"}>
                                    {currentWorkspace.path || "Click to open the folder"}
                                </span>
                            </>
                        }
                        isElasticity={false}
                        onClick={openDirectoryDialog}/>
                    <h5 className={"workspace__recent__title"}>Recent</h5>
                    <div className={"workspace__recent__list"}>
                        {
                            recent.map((workspace, index) => {
                                if (workspace.name === currentWorkspace.name) {
                                    return null;
                                }

                                return (
                                    <MDEButton key={workspace.name + index}
                                               text={
                                                   <>
                                                       <span className={"workspace__name"}>{workspace.name}</span>
                                                       <span className={"workspace__path"}>{workspace.path}</span>
                                                   </>
                                               }
                                               icon={<IconLoader name={"file-jump"}/>}
                                               iconPosition={"suffix"}
                                               onClick={() => switchWorkspace(workspace)}/>
                                );
                            })
                        }
                    </div>
                </div>
            </MDEPopover>
            <MDEExplorer dirPath={currentWorkspace?.path}/>
        </div>
    );
}

export default MDEFileManager;