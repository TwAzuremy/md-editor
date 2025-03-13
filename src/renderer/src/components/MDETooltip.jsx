import "@components/css/mde-tooltip.scss";

import {memo, useEffect, useState} from "react";
import {logger} from "@utils/Logger.js";

/**
 * A simple tooltip component.
 *
 * @function MDETooltip
 *
 * @param {ReactElement} children The content of the component.
 * @param {string} tip The text of the tooltip.
 * @param {string} [direction="top"] The direction of the tooltip.
 * @param {*} [props] Other props of the component.
 *
 * @returns {ReactElement} The rendered component.
 *
 * @example
 * <MDETooltip tip="This is a tooltip">Hover me!</MDETooltip>
 */
const MDETooltip = memo(({children, tip, direction = "top", ...props}) => {
    const [isValid, setIsValid] = useState(true);

    useEffect(() => {
        const validDirections = ["top", "bottom", "left", "right"];

        if (!validDirections.includes(direction)) {
            logger.error(`[${MDETooltip.displayName || MDETooltip.name}] Invalid direction: ${direction}`);
            setIsValid(false);
        }
    }, [direction]);

    // If the parameters do not meet the requirements, the component is not allowed to be rendered.
    if (!isValid) {
        return null;
    }

    return (
        <div className={"mde-tooltip"} data-direction={direction} {...props}>
            {children}
            <p className={"mde-tooltip__floating"}>
                <span>{tip}</span>
            </p>
        </div>
    );
});

export default MDETooltip;