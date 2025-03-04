import "@assets/css/app.scss";

import MDEHeader from "@renderer/container/MDEHeader.jsx";
import MDEContent from "@renderer/container/MDEContent.jsx";
import WindowDrag from "@components/WindowDrag.jsx";
import MDESidebarWrapper from "@renderer/container/MDESidebarWrapper.jsx";

function App() {
    return (
        <div id="app">
            {/* Window drag area used for the header */}
            <WindowDrag direction={"horizontal"}/>
            <MDEHeader/>
            {/* Window drag area for the sidebar */}
            <WindowDrag direction={"vertical"}/>
            <MDESidebarWrapper />
            <MDEContent/>
        </div>
    );
}

export default App;

