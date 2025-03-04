import "@assets/css/app.scss";

import MDEHeader from "@renderer/container/MDEHeader.jsx";
import MDESideNavBar from "@renderer/container/MDESideNavBar.jsx";
import MDESidebar from "@renderer/container/MDESidebar.jsx";
import MDEContent from "@renderer/container/MDEContent.jsx";
import WindowDrag from "@components/WindowDrag.jsx";
import {useState} from "react";

function App() {
    const [sidebar, setSidebar] = useState(null);

    return (
        <div id="app">
            {/* Window drag area used for the header */}
            <WindowDrag direction={"horizontal"}/>
            <MDEHeader/>
            {/* Window drag area for the sidebar */}
            <WindowDrag direction={"vertical"}/>
            <MDESideNavBar navClickEvent={setSidebar}/>
            <MDESidebar renderId={sidebar}/>
            <MDEContent/>
        </div>
    );
}

export default App;

