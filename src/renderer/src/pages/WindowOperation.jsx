import "./css/windowOperation.scss";

import TwButton from "@components/TwButton";
import TwIconLoader from "@components/TwIconLoader";
import React, { useEffect, useState } from "react";

function windowOperation() {
    const [isFullScreen, setIsFullScreen] = useState(false);

    useEffect(() => {
        // Listen for maximize event and update full screen status
        window.windowControls.onMaximize(setIsFullScreen);

        // Cleanup function to remove event listener on component unmount
        return () => {
            window.windowControls.removeAllListeners("maximize");
        };
    }, []);

    /**
     * Object containing window control functions
     */
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
      <div className={"window-operation"}>
          <TwButton className={"window-operation__minimize"} background={"hover-fill"} transition={true}
                    onClick={WindowControls.handleMinimize} title={"最小化"}>
              <TwIconLoader name={"minimize"} />
          </TwButton>
          <TwButton className={"window-operation__maximize"} background={"hover-fill"} transition={true}
                    onClick={WindowControls.handleMaximize} title={isFullScreen ? "还原" : "最大化"}>
              <TwIconLoader name={isFullScreen ? "restore" : "maximize"} />
          </TwButton>
          <TwButton className={"window-operation__close"} background={"hover-fill"} transition={true}
                    onClick={WindowControls.handleClose} title={"关闭"}>
              <TwIconLoader name={"close"} />
          </TwButton>
      </div>
    );
}

export default windowOperation;