import "./css/fileManagement.scss";

import React from "react";

import TwButton from "@components/TwButton.jsx";
import TwIconLoader from "@components/TwIconLoader.jsx";
import TwInput from "@components/TwInput.jsx";
import TwDivide from "@components/TwDivide.jsx";
import TwBubble from "@components/TwBubble.jsx";
import TwTree from "@components/TwTree.jsx";

function FileManagement({...props}) {
    const searchInput = React.useRef(null);

    return (
        <div className={"file-management"} {...props}>
            <header className={"file-management__header"}>
                <TwButton background={"fill"}>
                    <TwIconLoader name={"left"}/>
                </TwButton>
                <TwInput
                    icon={<TwIconLoader name={"search"}/>}
                    iconPosition={"prefix"}
                    placeholder={"Search Files"}
                    ref={searchInput}/>
            </header>
            <div className={"file-management__title"}>
                <h1 className={"file-management__folder-name"}>Folder</h1>
                <TwBubble
                    triggerEl={
                        <TwButton background={"transparent"}>
                            <TwIconLoader name={"plus"}/>
                        </TwButton>
                    }
                    containerEl={
                        <div className={"file-management__add-panel"}>
                            <TwButton className={"file-management__add-folder"} background={"fill"}>
                                <TwIconLoader name={"folder-face"}/>
                                <span>Add Folder</span>
                            </TwButton>
                            <TwButton className={"file-management__add-file"} background={"fill"}>
                                <TwIconLoader name={"file"}/>
                                <span>Add Markdown File</span>
                            </TwButton>
                        </div>
                    }
                    direction={"bottom"}
                    position={"right"}
                    paddingCompensation={8}/>
            </div>
            <TwDivide direction={"horizontal"}/>
            <TwTree />
        </div>
    );
}

export default FileManagement;