import "./css/windowOperation.scss";

import TwButton from "@components/TwButton";
import TwIconLoader from "@components/TwIconLoader";
import React, {useEffect, useState} from "react";
import TwTooltips from "@components/TwTooltips.jsx";

function WindowOperation() {
    const [isMaximize, setIsMaximize] = useState(false);

    useEffect(() => {
        // Listen for maximize event and update full screen status
        window.windowControls.onMaximize(setIsMaximize);

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
            <TwTooltips
                className={"window-operation__bubble-minimize"}
                triggerEl={
                    <TwButton className={"window-operation__minimize"} background={"hover-fill"} transition={true}
                              onClick={WindowControls.handleMinimize}>
                        <TwIconLoader name={"minimize"}/>
                    </TwButton>
                }
                trigger={"hover"}
                text={"Minimize"}
                direction={"bottom"}/>
            <TwTooltips
                className={"window-operation__bubble-maximize"}
                triggerEl={
                    <TwButton className={"window-operation__maximize"} background={"hover-fill"} transition={true}
                              onClick={WindowControls.handleMaximize}>
                        <TwIconLoader name={isMaximize ? "restore" : "maximize"}/>
                    </TwButton>
                }
                trigger={"hover"}
                text={isMaximize ? "Restore": "Maximize"}
                direction={"bottom"}/>
            <TwTooltips
                className={"window-operation__bubble-close"}
                triggerEl={
                    <TwButton className={"window-operation__close"} background={"hover-fill"} transition={true}
                              onClick={WindowControls.handleClose}>
                        <TwIconLoader name={"close"}/>
                    </TwButton>
                }
                trigger={"hover"}
                text={"Close"}
                direction={"bottom"}/>
        </div>
    );
}

export default WindowOperation;