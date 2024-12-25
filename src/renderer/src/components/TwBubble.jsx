import "./css/TwBubble.scss";
import React from "react";

/**
 *
 * @param {String} className
 * @param triggerEl
 * @param containerEl
 * @param {String} direction top / bottom / left / right
 * @param [String] position When the direction is top / bottom, fill in left / center / right, and when it is left / right, fill in top / center / bottom.
 * @param {Number} paddingCompensation Since the height obtained by scrollHeight is only the height of padding-top + itself,
 *                  and lacks the size of padding-bottom, you need to fill in the padding value you set here for compensation.
 * @param props
 * @returns
 * @constructor
 */
function TwBubble({
                      className = "",
                      triggerEl,
                      containerEl,
                      direction = "bottom",
                      position = "center",
                      paddingCompensation = 0,
                      ...props
                  }) {
    const bubble = React.useRef(null);
    const container = React.useRef(null);

    function handleClick() {
        if (bubble.current.classList.contains("tw-bubble--active")) {
            bubble.current.classList.remove("tw-bubble--active");
            container.current.removeAttribute("style");
        } else {
            bubble.current.classList.add("tw-bubble--active");

            container.current.style.width = container.current.firstElementChild.scrollWidth + "px";
            container.current.style.height = container.current.firstElementChild.scrollHeight + paddingCompensation + "px";
        }
    }

    return (
        <div className={"tw-bubble " + (className || "")} data-direction={direction} data-position={position} {...props}
             ref={bubble}>
            {
                React.cloneElement(triggerEl, {
                    className: `${triggerEl.props.className || ""} tw-bubble__trigger`.trim(),
                    onClick: (event) => {
                        // Check if there is an onClick handler for the trigger element
                        if (triggerEl.props.onClick) {
                            triggerEl.props.onClick(event);
                        }

                        handleClick(event);
                    }
                })
            }
            <div className={"tw-bubble__container"} ref={container}>
                {containerEl}
            </div>
        </div>
    );
}

export default TwBubble;