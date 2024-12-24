import "./css/TwTooltips.scss";

import React from "react";

/**
 *
 * @param className
 * @param triggerEl
 * @param {String} text
 * @param {String} trigger "hover" | "click"
 * @param {String} direction "top" | "bottom" | "left" | "right"
 * @param props
 * @returns {JSX.Element}
 * @constructor
 */
function TwTooltips({
                        className = "",
                        triggerEl,
                        text = "",
                        trigger = "hover",
                        direction = "bottom",
                        ...props
                    }) {
    const bubble = React.useRef(null);

    function handleClick() {
        bubble.current.classList.toggle("tw-tooltips--active");
    }

    return (
        <div className={"tw-tooltips " + (className || "")} data-trigger-mode={trigger} data-direction={direction}
             ref={bubble}>
            {
                React.cloneElement(triggerEl, {
                    className: `${triggerEl.props.className || ""} tw-tooltips__trigger`.trim(),
                    onClick: (event) => {
                        // Check if there is an onClick handler for the trigger element
                        if (triggerEl.props.onClick) {
                            triggerEl.props.onClick(event);
                        }

                        // Check if the trigger type is "click" and there is a handleClick function
                        if (trigger === "click" && handleClick) {
                            handleClick(event);
                        }
                    }
                })
            }
            <div className={"tw-tooltips__content"}>
                <p className={"tw-tooltips__text"}>{text}</p>
            </div>
        </div>
    );
}

export default TwTooltips;