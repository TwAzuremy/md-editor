import "@components/css/mde-explorer-controller.scss";

import {memo} from "react";
import MDEButton from "@components/MDEButton.jsx";
import IconLoader from "@components/IconLoader.jsx";
import MDETooltip from "@components/MDETooltip.jsx";
import {useSelector} from "react-redux";
import {selectSelectedFolder} from "@store/folderSlice.js";

const MDEExplorerController = memo(({
                                        dirPath = null,
                                        onRefresh = null,
                                        onCreateFile = null
                                    }) => {
    const taggedFolderPath = useSelector(selectSelectedFolder);

    const EXPLORER_CONTROLLER = [
        {
            icon: <IconLoader name={"folder-plus"}/>,
            tip: "New Folder",
            onClick: () => onCreateFile?.(taggedFolderPath, false)
        },
        {
            icon: <IconLoader name={"file-plus"}/>,
            tip: "New Markdown File",
            onClick: () => onCreateFile?.(taggedFolderPath, true)
        },
        {
            icon: <IconLoader name={"refresh"}/>,
            tip: "Refresh Workspace",
            onClick: onRefresh
        },
        {
            icon: <IconLoader name={"disk"}/>,
            tip: "Open in System Explorer",
            /**
             * @function onClick
             * @description Open the directory in the system explorer. If the directory does not exist, do nothing.
             */
            onClick: async () => {
                const isExists = await window.explorer.checkPathExists(dirPath);

                if (isExists) {
                    // noinspection JSIgnoredPromiseFromCall
                    await window.explorer.openInSystemExplorer(dirPath);
                }
            }
        }
    ];

    return (
        <div className={"mde-explorer-controller"}>
            {
                EXPLORER_CONTROLLER.map(button => {
                    return (
                        <MDETooltip key={button.tip} tip={button.tip} direction={"top"}>
                            <MDEButton icon={button.icon} onClick={button.onClick}/>
                        </MDETooltip>
                    );
                })
            }
        </div>
    );
});

export default MDEExplorerController;