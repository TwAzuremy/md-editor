import "@components/css/mde-button.scss";

import React from "react";

const MDEButton = React.forwardRef(({
                                        icon,
                                        text,
                                        iconPosition = "prefix",
                                        isElasticity = true,
                                        ...props
                                    }, ref) => {
    return (
        <button {...props} ref={ref}
                className={"mde-button" +
                    (props.className ? ` ${props.className}` : "") +
                    (isElasticity ? " mde-button__elasticity" : "")}>
            {iconPosition === "prefix" && <span className={"mde-button__icon"}>{icon}</span>}
            {text && <span className={"mde-button__text"}>{text}</span>}
            {iconPosition === "suffix" && <span className={"mde-button__icon"}>{icon}</span>}
        </button>
    );
})

export default MDEButton;