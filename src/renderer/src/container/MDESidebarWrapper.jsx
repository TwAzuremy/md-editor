import MDESideNavBar from "@renderer/container/MDESideNavBar.jsx";
import MDESidebar from "@renderer/container/MDESidebar.jsx";
import {useState} from "react";
import IconLoader from "@components/IconLoader.jsx";

/**
 * @prop {string} id Id of the nav bar and sidebar page switch.
 * @prop {string} tip The tooltip of the nav bar.
 * @prop {ReactElement} icon The icon of the nav bar.
 * @prop {ReactElement} component The component of the sidebar.
 *
 * @type {[{id: string, tip: string, icon: ReactElement, component: ReactElement}]}
 */
const sidebarList = [
    {
        "id": "file-manager",
        "tip": "File Manager",
        "icon": <IconLoader name={"file-manager"}/>,
        "component": <span>File Manager</span>
    },
    // TODO: [Deleted] Here is the test case.
    {
        "id": "test",
        "tip": "Test",
        "icon": <IconLoader name={"settings"}/>,
        "component": <span>Test Page</span>
    }
];

function MDESidebarWrapper() {
    const [renderId, setRenderId] = useState(null);

    return (
        <>
            <MDESideNavBar navClickEvent={setRenderId} navList={sidebarList}/>
            <MDESidebar renderId={renderId} pageList={sidebarList}/>
        </>
    );
}

export default MDESidebarWrapper;