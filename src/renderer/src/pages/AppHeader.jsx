import "../assets/css/appHeader.scss";

import React, { useEffect, useState } from "react";

import TwButton from "../components/TwButton";
import TwIconLoader from "../components/TwIconLoader";

function AppHeader() {
    const ipcRenderer = window.electron.ipcRenderer;

    const [isFullScreen, setIsFullScreen] = useState(false);
    const [filename, setFilename] = useState("README");

    useEffect(() => {
        ipcRenderer.on("maximize", (_, isFullScreen) => {
            setIsFullScreen(isFullScreen);
        });

        return () => {
            ipcRenderer.removeAllListeners("maximize");
        };
    }, []);

    const WindowControls = {
        handleMinimize: () => {
            window.windowControls.send("window-minimize");
        },
        handleMaximize: () => {
            window.windowControls.send("window-maximize");
        },
        handleClose: () => {
            window.windowControls.send("window-close");
        }
    };

    return (
      <header id="app__header">
          <h2 className={"filename__container"}>
              {filename}
          </h2>
          <div className={"window-drag"}></div>
          <div className={"window-operation"}>
              <TwButton background={"hover-fill"} transition={true} onClick={WindowControls.handleMinimize}>
                  <TwIconLoader name={"minimize"} />
              </TwButton>
              <TwButton background={"hover-fill"} transition={true} onClick={WindowControls.handleMaximize}>
                  <TwIconLoader name={isFullScreen ? "restore" : "maximize"} />
              </TwButton>
              <TwButton background={"hover-fill"} transition={true} onClick={WindowControls.handleClose}>
                  <TwIconLoader name={"close"} />
              </TwButton>
          </div>
      </header>
    );
}

export default AppHeader;