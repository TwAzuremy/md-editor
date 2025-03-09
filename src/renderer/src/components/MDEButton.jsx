import "@components/css/mde-button.scss";

import React, { memo } from "react";

/**
 * A button component with an icon and text.
 *
 * @function MDEButton
 *
 * @param {ReactElement} icon The icon to be displayed.
 * @param {string|ReactElement} text The text to be displayed.
 * @param {string} iconPosition="prefix" The position of the icon relative to the text.
 * @param {boolean} isElasticity=true Whether the button should have an elastic effect.
 * @param {boolean} active=false If the button is active.
 * @param {*} props Any additional props to be passed to the button.
 *
 * @returns {ReactElement}
 *
 * @example
 * <MDEButton icon={<IconLoader name="icon"/>} text={"Text"} name={"Icon-Text Button"}/>
 */
const MDEButton = memo(function MDEButton({
    icon,
    text,
    iconPosition = "prefix",
    isElasticity = true,
    active = false,
    className,
    ...props
}) {
    // Change the class name construction to increase readability
    const buttonClassName = [
        "mde-button",
        className,
        isElasticity ? "mde-button__elasticity" : "",
        active ? "active" : ""
    ].filter(Boolean).join(" ");
    
    return (
        <button {...props} className={buttonClassName}>
            {(icon && iconPosition === "prefix") && <span className="mde-button__icon">{icon}</span>}
            {text && <span className="mde-button__text">{text}</span>}
            {(icon && iconPosition === "suffix") && <span className="mde-button__icon">{icon}</span>}
        </button>
    );
});

export default MDEButton;