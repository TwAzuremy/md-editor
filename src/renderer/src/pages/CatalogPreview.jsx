import "./css/catalogPreview.scss";
import TwButton from "@components/TwButton.jsx";
import TwIconLoader from "@components/TwIconLoader.jsx";
import TwInput from "@components/TwInput.jsx";
import React from "react";

function CatalogPreview({...props}) {
    const searchInput = React.useRef(null);

    return (
        <div className={"catalog-preview"} {...props}>
            <header className={"catalog-preview__header"}>
                <TwButton background={"fill"}>
                    <TwIconLoader name={"left"}/>
                </TwButton>
                <TwInput
                    icon={<TwIconLoader name={"search"}/>}
                    iconPosition={"prefix"}
                    placeholder={"Search Catalog"}
                    ref={searchInput}/>
            </header>
        </div>
    );
}

export default CatalogPreview;