import "@components/css/window-controller.scss";

import IconLoader from "@components/IconLoader.jsx";
import {useEffect, useRef, useState} from "react";
import MDEButton from "@components/MDEButton.jsx";

function WindowController() {
    const controllerEl = useRef(null);
    const [isMaximized, setIsMaximized] = useState(false);

    useEffect(() => {
        window.windowControls.onMaximize(morph);

        (async function checkMaximized() {
            const maximized = await window.windowControls.isMaximized();
            setIsMaximized(maximized);
        })();
    }, []);

    function morph(isMaximized) {
        const svg = controllerEl.current.querySelector("#window-controller__maximize svg");

        // If it's maximized, the path is set to the path of "maximized".
        // If it's not maximized, set the path to the path of "windowing".
        const morphPath = svg.dataset[isMaximized ? "maximized" : "windowing"];
        svg.querySelector("#rect").setAttribute("d", morphPath);

        // Used to control the transition of the path. In particular, paths with id "sec-rect".
        svg.classList.toggle("windowing", !isMaximized);

        requestAnimationFrame(() => setIsMaximized(isMaximized));
    }

    return (
        <div id={"window-controller"} ref={controllerEl}>
            <MDEButton
                id={"window-controller__minimize"}
                icon={<IconLoader name={"minimize"}/>}
                isElasticity={false}
                onClick={() => window.windowControls.send("window-minimize")}/>
            <MDEButton
                id={"window-controller__maximize"}
                // When initializing, get whether the window is maximized.
                icon={<IconLoader name={"maximize"} className={isMaximized ? "" : "windowing"}/>}
                isElasticity={false}
                onClick={() => window.windowControls.send("window-maximize")}/>
            <MDEButton
                id={"window-controller__close"}
                icon={<IconLoader name={"close"}/>}
                isElasticity={false}
                onClick={() => window.windowControls.send("window-close")}/>
        </div>
    );
}

export default WindowController;