import "@assets/css/app.scss";

import MDEHeader from "@renderer/container/MDEHeader.jsx";
import MDESideNavBar from "@renderer/container/MDESideNavBar.jsx";
import MDESidebar from "@renderer/container/MDESidebar.jsx";
import MDEContent from "@renderer/container/MDEContent.jsx";

function App() {
    return (
        <div id="app">
            <MDEHeader/>
            <MDESideNavBar/>
            <MDESidebar/>
            <MDEContent/>
        </div>
    );
}

export default App;

