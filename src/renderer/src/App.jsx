import "@assets/css/app.scss";

// import { headingsPlugin, MDXEditor } from '@mdxeditor/editor';
// import "@mdxeditor/editor/style.css";
import AppHeader from "./AppHeader";
import AppSidebar from "@renderer/AppSidebar.jsx";
import AppContent from "@renderer/AppContent.jsx";

function App() {
    return (
        <div id="app">
            {/* <MDXEditor markdown={"# Hello World"} plugins={[headingsPlugin()]} /> */}
            <AppHeader/>
            <AppSidebar/>
            <AppContent/>
        </div>
    );
}

export default App;

