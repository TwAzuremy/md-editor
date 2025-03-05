import "@assets/css/app.scss";

import MDEHeader from "@renderer/container/MDEHeader.jsx";
import MDEContent from "@renderer/container/MDEContent.jsx";
import WindowDrag from "@components/WindowDrag.jsx";
import MDESideNavBar from "@renderer/container/MDESideNavBar.jsx";
import MDESidebar from "@renderer/container/MDESidebar.jsx";
import IconLoader from "@components/IconLoader.jsx";
import MDEFileManager from "@renderer/container/sidebar/MDEFileManager.jsx";

import {useState} from "react";

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
        "component": <MDEFileManager/>
    },
    // TODO: [Deleted] Here is the test case.
    {
        "id": "test",
        "tip": "Test",
        "icon": <IconLoader name={"settings"}/>,
        "component": <span>Test Page</span>
    }
];

function App() {
    return (
        <div id="app">
            {/* Window drag area used for the header */}
            <WindowDrag direction={"horizontal"}/>
            <MDEHeader/>
            {/* Window drag area used for the sidebar */}
            <WindowDrag direction={"vertical"}/>
            <SidebarWrapper />
            <MDEContent/>
        </div>
    );
}

function SidebarWrapper() {
    const [renderId, setRenderId] = useState(null);

    // noinspection JSValidateTypes
    return (
        <>
            <MDESideNavBar navClickEvent={setRenderId} navList={sidebarList}/>
            <MDESidebar renderId={renderId} pageList={sidebarList}/>
        </>
    );
}

export default App;

