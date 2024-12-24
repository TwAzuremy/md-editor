import "./assets/css/appHeader.scss";

import React, { useState } from "react";
import WindowOperation from "./pages/WindowOperation";

function AppHeader() {
    const [filename, setFilename] = useState("Undefined");

    return (
      <header id="app__header">
          <h1 className={"filename__container"}>
              {filename}
          </h1>
          <div className={"window-drag"}></div>
          <WindowOperation />
      </header>
    );
}

export default AppHeader;