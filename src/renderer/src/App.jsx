import { headingsPlugin, MDXEditor } from '@mdxeditor/editor';
import '@mdxeditor/editor/style.css';

function App() {
    return (
        <div id="app">
            <MDXEditor markdown={"# Hello World"} plugins={[headingsPlugin()]} />
        </div>
    );
}

export default App

