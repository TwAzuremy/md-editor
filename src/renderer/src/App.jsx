import "./assets/css/app.scss";

// import { headingsPlugin, MDXEditor } from '@mdxeditor/editor';
import "@mdxeditor/editor/style.css";
import AppHeader from "./pages/AppHeader";

function App() {
    return (
      <div id="app">
          {/* <MDXEditor markdown={"# Hello World"} plugins={[headingsPlugin()]} /> */}
          <AppHeader />
      </div>
    );
}

export default App;

