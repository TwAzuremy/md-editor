import "@components/css/mde-input.scss";

import IconLoader from "@components/IconLoader.jsx";
import MDEButton from "@components/MDEButton.jsx";
import {useRef} from "react";

function MDEInput({
                      icon,
                      ...props
                  }) {
    const inputEl = useRef(null);

    function clear() {
        inputEl.current.value = "";
        inputEl.current.focus();
    }

    return (
        <div className={"mde-input"}>
            {icon && <div className={"mde-input__icon"}>{icon}</div>}
            <input className={"mde-input__input"} {...props} ref={inputEl}/>
            <MDEButton className={"mde-input__clear"}
                       icon={<IconLoader name={"close"}/>}
                       onClick={clear}/>
        </div>
    );
}

export default MDEInput;