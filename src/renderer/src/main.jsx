import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "@assets/css/base.scss";
import store from "@store/store";
import {Provider} from "react-redux";
import {scan} from "react-scan";

scan({
    enabled: true,
    log: false,
    playSound: false,
    showToolbar: true
})

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <Provider store={store}>
            <App/>
        </Provider>
    </React.StrictMode>
);
