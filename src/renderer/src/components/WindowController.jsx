import "@components/css/window-controller.scss";

import IconLoader from "@components/IconLoader.jsx";
import {useEffect, useRef, useState} from "react";
import MDEButton from "@components/MDEButton.jsx";

function WindowController() {
    const [isMaximized, setIsMaximized] = useState(false);

    const controllerEl = useRef(null);

    useEffect(() => {
        // Listen to whether the window is maximized.
        window.windowControls.onMaximize(morph);

        // When initializing, get whether the window is maximized.
        (async function checkMaximized() {
            const maximized = await window.windowControls.isMaximized();
            setIsMaximized(maximized);
        })();
    }, []);

    /**
     * Updates the SVG path and visual state based on the maximized state of the window.
     *
     * @param {boolean} isMaximized - Indicates whether the window is maximized.
     *
     * This function modifies the SVG path to reflect the current window state,
     * toggling between "maximized" and "windowing" paths. It also manages the
     * path transition by toggling the "windowing" class and updates the React
     * state after the transition to ensure animations are executed correctly.
     */
    function morph(isMaximized) {
        const svg = controllerEl.current.querySelector("#window-controller__maximize svg");

        // If it's maximized, the path is set to the path of "maximized".
        // If it's not maximized, set the path to the path of "windowing".
        const morphPath = svg.dataset[isMaximized ? "maximized" : "windowing"];
        svg.querySelector("#rect").setAttribute("d", morphPath);

        // Used to control the transition of the path. In particular, paths with id "sec-rect".
        svg.classList.toggle("windowing", !isMaximized);

        // Since updating the "React state" value will update the component, the transition/animation will not be executed.
        // So set the "React state" value to update it after the transition/animation is executed.
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