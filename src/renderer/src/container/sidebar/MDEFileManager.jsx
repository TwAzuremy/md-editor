import "@renderer/container/css/mde-file-manager.scss";

import MDEInput from "@components/MDEInput.jsx";
import IconLoader from "@components/IconLoader.jsx";
import MDEPopover from "@components/MDEPopover.jsx";
import MDEButton from "@components/MDEButton.jsx";
import {useEffect, useRef, useState} from "react";
import MDEExplorer from "@components/MDEExplorer.jsx";
import MDEExplorerController from "@components/MDEExplorerController.jsx";
import ElectronStore from "@utils/ElectronStore.js";
import {TempProvider} from "@renderer/provider/TempProvider.jsx";

/**
 * Use this when you don't have a workspace
 *
 * @type {{name: string, path: string|null}}
 */
const NO_WORKSPACE = {
    name: "No open workspace",
    path: null
};

function MDEFileManager() {
    const explorerRef = useRef(null);

    const [currentWorkspace, setCurrentWorkspace] = useState(NO_WORKSPACE);
    const [recent, setRecent] = useState([]);

    useEffect(() => {
        (async () => {
            const DATA_WORKSPACE = await ElectronStore.get(ElectronStore.KEY_WORKSPACE);
            const DATA_RECENT = await ElectronStore.get(ElectronStore.KEY_WORKSPACE_RECENT);

            setCurrentWorkspace(DATA_WORKSPACE || NO_WORKSPACE);
            setRecent(DATA_RECENT || []);
        })();
    }, []);

    /**
     * Switches the current workspace to the specified workspace.
     *
     * This function checks if the specified workspace path exists. If it does,
     * it updates the current workspace state and persists the workspace in the Electron store.
     *
     * @param {Object} workspace - The workspace to switch to.
     * @param {string} workspace.name - The name of the workspace.
     * @param {string|null} workspace.path - The path of the workspace.
     *
     * @returns {Promise<void>} - A promise that resolves when the workspace is switched and stored.
     */
    async function switchWorkspace(workspace) {
        const isExits = await window.explorer.checkPathExists(workspace.path);

        if (isExits) {
            setCurrentWorkspace(workspace);
            await ElectronStore.set(ElectronStore.KEY_WORKSPACE, workspace);
        }
    }

    /**
     * Open a directory dialog, select a directory and make it the current workspace.
     *
     * @returns {Promise<void>} - A promise that resolves when the operation is complete.
     */
    async function openDirectoryDialog() {
        const workspace = await window.explorer.openDirectoryDialog();

        // After clicking Cancel, the return value is "undefined"
        if (!workspace) {
            return;
        }

        setCurrentWorkspace(workspace);
        await ElectronStore.set(ElectronStore.KEY_WORKSPACE, workspace);
        await addToRecentStore(workspace);
    }

    /**
     * Adds the given workspace to the recent store.
     *
     * The function updates the recent list by adding the new workspace at the beginning
     * and removing any existing entry with the same path. It then updates the recent
     * workspaces in the Electron store.
     *
     * @param {Object} workspace - The workspace to add to recent.
     * @param {string} workspace.name - The name of the workspace.
     * @param {string|null} workspace.path - The path of the workspace.
     *
     * @returns {Promise<void>} - A promise that resolves when the operation is complete.
     */
    async function addToRecentStore(workspace) {
        const filtered = recent.filter(item => item.path !== workspace.path);
        const newRecent = [workspace, ...filtered];

        setRecent(newRecent);
        await ElectronStore.set(ElectronStore.KEY_WORKSPACE_RECENT, newRecent);
    }

    return (
        <div id={"mde-file-manager"}>
            <MDEInput
                type={"text"}
                placeholder={"Search Files"}
                icon={<IconLoader name={"search"}/>}/>
            <MDEPopover direction={"right"} nearEdge={"top"}>
                <div className={"workspace"} slot={"default"}>
                    <p className={"workspace__name"}>{currentWorkspace.name}</p>
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
                    {/* Filter out the workspace that is currently being displayed */}
                    {recent.filter(ws => ws.name !== currentWorkspace.name).length > 0 &&
                        <>
                            <h5 className={"workspace__recent__title"}>Recent</h5>
                            <div className={"workspace__recent__list"}>
                                {recent
                                    .filter(ws => ws.name !== currentWorkspace.name)
                                    .map((workspace, index) => {
                                        return (
                                            <MDEButton key={workspace.name + index}
                                                       text={
                                                           <>
                                                               <span className={"workspace__name"}>
                                                                   {workspace.name}
                                                               </span>
                                                               <span className={"workspace__path"}>
                                                                   {workspace.path}
                                                               </span>
                                                           </>
                                                       }
                                                       icon={<IconLoader name={"file-jump"}/>}
                                                       iconPosition={"suffix"}
                                                       onClick={() => switchWorkspace(workspace)}/>
                                        );
                                    })}
                            </div>
                        </>
                    }
                </div>
            </MDEPopover>
            <TempProvider>
                <MDEExplorer dirPath={currentWorkspace?.path} ref={explorerRef}/>
                <MDEExplorerController
                    dirPath={currentWorkspace?.path}
                    onRefresh={explorerRef.current?.refresh}
                    onCreateFile={explorerRef.current?.createFile}/>
            </TempProvider>
        </div>
    );
}

export default MDEFileManager;