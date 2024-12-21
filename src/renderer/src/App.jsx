import './assets/css/main.scss';

// import { headingsPlugin, MDXEditor } from '@mdxeditor/editor';
import '@mdxeditor/editor/style.css';
import AppHeader from './pages/Header';

function App() {
    return (
        <div id="app">
            {/* <MDXEditor markdown={"# Hello World"} plugins={[headingsPlugin()]} /> */}
            <AppHeader />
        </div>
    );
}

export default App;

