import "@renderer/container/css/mde-sideNavBar.scss";

import {lazy, Suspense, useState} from "react";
import MDEButton from "@components/MDEButton.jsx";
import IconLoader from "@components/IconLoader.jsx";
import MDETooltip from "@components/MDETooltip.jsx";

const LOGO = lazy(() => import(`@resources/icons/icon.svg?react`));

/**
 * A navigation bar component for markdown-editor.
 *
 * @function MDESideNavBar
 *
 * @param {function} navClickEvent The event handler for the navigation click event.
 * @param {[{id: string, tip: string, icon: ReactElement}]} [navList=[]] A list of information in the sidebar.
 *
 * @returns {ReactElement} The rendered component.
 *
 * @example
 * <MDESideNavBar navClickEvent={(id) => console.log(id)} navList={[{...}, ...]}/>
 */
function MDESideNavBar({navClickEvent, navList = []}) {
    const [renderId, setRenderId] = useState(null);

    // TODO: [Fixed] After updating the value of useState, too many components may be re-rendered, causing the page to flicker noticeably.
    function navClickHandle(id = null) {
        navClickEvent?.(id);
        setRenderId(id);
    }

    return (
        <nav id={"mde-sideNavBar"}>
            <header id={"mde-sideNavBar__header"}>
                <h6 className={"mde-name"}>
                    {/* Tested many methods, "text-align: justify;" None of them have taken effect properly. */}
                    {/* So I had to use the Flex layout to solve it. */}
                    {"MDE".split("").map((char, index) => <span key={index}>{char}</span>)}
                </h6>
                <Suspense fallback={null}>
                    <LOGO className={"mde-icon"}/>
                </Suspense>
            </header>
            <div className={"mde-nav-list"}>
                {
                    navList.map(({id, tip, icon}) => (
                        <MDETooltip tip={tip} direction={"right"} key={id}>
                            <MDEButton className={"mde-nav__button"}
                                       active={renderId === id}
                                       icon={icon}
                                       onClick={() => navClickHandle(id)}/>
                        </MDETooltip>
                    ))
                }
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