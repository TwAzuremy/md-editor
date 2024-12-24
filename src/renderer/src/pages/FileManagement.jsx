import "./css/fileManagement.scss";

import React from "react";

import TwButton from "@components/TwButton.jsx";
import TwIconLoader from "@components/TwIconLoader.jsx";
import TwInput from "@components/TwInput.jsx";

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
        </div>
    );
}

export default FileManagement;