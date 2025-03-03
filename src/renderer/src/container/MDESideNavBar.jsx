import "@renderer/container/css/mde-sideNavBar.scss";

import {lazy, Suspense, useState} from "react";
import MDEButton from "@components/MDEButton.jsx";
import IconLoader from "@components/IconLoader.jsx";
import MDETooltip from "@components/MDETooltip.jsx";

/**
 * A navigation bar component for markdown-editor.
 *
 * @function MDESideNavBar
 *
 * @param {function} navClickEvent The event handler for the navigation click event.
 *
 * @returns {ReactElement} The rendered component.
 *
 * @example
 * <MDESideNavBar navClickEvent={(id) => console.log(id)}/>
 */
function MDESideNavBar({navClickEvent}) {
    const Icon = lazy(() => import(`@resources/icons/icon.svg?react`));
    const [renderId, setRenderId] = useState(null);

    // TODO: [Fixed] After updating the value of useState, too many components may be re-rendered, causing the page to flicker noticeably.
    function navClickHandle(id = null) {
        navClickEvent?.(id);
        setRenderId(id);
    }

    return (
        <nav id={"mde-sideNavBar"}>
            <header id={"mde-sideNavBar__header"}>
                <h6 className={"mde-name"}>MDE</h6>
                <Suspense fallback={null}>
                    <Icon className={"mde-icon"}/>
                </Suspense>
            </header>
            <div className={"mde-nav-list"}>
                <MDETooltip tip={"File Manager"} direction={"right"}>
                    <MDEButton className={"mde-nav__button"}
                               active={renderId === "file-manager"}
                               icon={<IconLoader name={"file-manager"}/>}
                               onClick={() => navClickHandle("file-manager")}/>
                </MDETooltip>
                {/* TODO: [Deleted] Here is the test case. */}
                <MDETooltip tip={"Test"} direction={"right"}>
                    <MDEButton className={"mde-nav__button"}
                               active={renderId === "test"}
                               icon={<IconLoader name={"settings"}/>}
                               onClick={() => navClickHandle("test")}/>
                </MDETooltip>
                <div className={"_blank"}></div>
            </div>
            <div className={"mde-settings-list"}>
                <MDETooltip tip={"Settings"} direction={"right"}>
                    <MDEButton className={"mde-settings__button"}
                               icon={<IconLoader name={"settings"}/>}/>
                </MDETooltip>
            </div>
        </nav>
    );
}

export default MDESideNavBar;