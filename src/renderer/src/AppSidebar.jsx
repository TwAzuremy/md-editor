import "@assets/css/appSidebar.scss";

import {useState} from "react";

import TwIconLoader from "@components/TwIconLoader.jsx";
import TwTooltips from "@components/TwTooltips.jsx";
import TwButton from "@components/TwButton.jsx";
import TwDivide from "@components/TwDivide.jsx";
import FileManagement from "@renderer/pages/FileManagement.jsx";
import CatalogPreview from "@renderer/pages/CatalogPreview.jsx";

function AppSidebar() {
    const [panelDisplay, setPanelDisplay] = useState(-1);

    function handleSwapPanel(panel) {
        setPanelDisplay(panel);
    }

    return (
        <aside id="app__sidebar">
            <div className={"sidebar__control"}>
                <div id={"logo"}>
                    <TwIconLoader name={"icon"}/>
                </div>
                <TwTooltips
                    triggerEl={
                        <TwButton onClick={handleSwapPanel.bind(this, 0)}
                                  data-change-color={panelDisplay === 0}>
                            <TwIconLoader name={"folder-line"}/>
                        </TwButton>
                    }
                    trigger={"hover"}
                    text={"Folder"}
                    direction={"right"}/>
                <TwTooltips
                    triggerEl={
                        <TwButton onClick={handleSwapPanel.bind(this, 1)}
                                  data-change-color={panelDisplay === 1}>
                            <TwIconLoader name={"catalog"}/>
                        </TwButton>
                    }
                    trigger={"hover"}
                    text={"Catalog"}
                    direction={"right"}/>
                <div className={"window-drag"}></div>
                <TwTooltips
                    triggerEl={
                        <TwButton>
                            <TwIconLoader name={"settings"}/>
                        </TwButton>
                    }
                    trigger={"hover"}
                    text={"Settings"}
                    direction={"right"}/>
            </div>
            <TwDivide direction={"vertical"}/>
            <div className={"sidebar__content"} style={{"--content-offset-magnification": panelDisplay}}>
                <FileManagement/>
                <CatalogPreview/>
            </div>
        </aside>
    );
}

export default AppSidebar;