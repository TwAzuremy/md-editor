import "./css/twInput.scss";

import React from "react";
import TwIconLoader from "@components/TwIconLoader.jsx";
import TwButton from "@components/TwButton.jsx";

const TwInput = React.forwardRef(({
                                      icon,
                                      iconPosition = "prefix",
                                      className,
                                      ...props
                                  }, forwardedRef) => {

    const ref = forwardedRef || React.useRef(null);

    function handleEmpty() {
        ref.current.value = "";
        ref.current.focus();
    }

    return (
        <div className={"tw-input__container"}>
            {(icon && iconPosition === "prefix") && <div className={"tw-input__prefix-icon"}>{icon}</div>}
            <input className={"tw-input " + (className || "")} ref={ref} {...props}/>
            <TwButton className={"tw-input__empty"} background={"transparent"} onClick={handleEmpty}>
                <TwIconLoader name={"close"}/>
            </TwButton>
            {(icon && iconPosition === "suffix") && <div className={"tw-input__prefix-icon"}>{icon}</div>}
        </div>
    );
});

export default TwInput;