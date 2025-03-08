import "@renderer/container/css/mde-file-manager.scss";

import MDEInput from "@components/MDEInput.jsx";
import IconLoader from "@components/IconLoader.jsx";
import MDEPopover from "@components/MDEPopover.jsx";
import MDEButton from "@components/MDEButton.jsx";
import {useState} from "react";

// TODO: [TEST] Simulate the data of the workspace.
const current = {
    name: "No open workspace",
    path: "The workspace was not found"
};

const recent = [
    {
        name: "Notes",
        path: "D:\\markdown-editor\\notes"
    },
    {
        name: "Information",
        path: "D:\\markdown-editor\\information"
    },
    {
        name: "Class Notes",
        path: "D:\\class-notes"
    }
];

function MDEFileManager() {
    const [currentWorkspace, setCurrentWorkspace] = useState(current);

    function switchWorkspace(workspace) {
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
                    <MDEButton text={
                        <>
                            <span className={"workspace__name"}>{currentWorkspace.name}</span>
                            <span className={"workspace__path"}>{currentWorkspace.path}</span>
                        </>
                    } isElasticity={false}/>
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
        </div>
    );
}

export default MDEFileManager;