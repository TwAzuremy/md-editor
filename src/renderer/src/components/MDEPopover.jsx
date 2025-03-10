import "@components/css/mde-popover.scss";

import React, {useEffect, useRef, useState} from "react";
import {logger} from "@utils/Logger.js";

/**
 * A Popover component with a floating content.
 *
 * @function MDEPopover
 *
 * @param {ReactElement} children The default slot content.
 * @param {string} [direction="bottom"] The direction of the floating content.
 * @param {string} [nearEdge="center"] The near edge of the floating content.
 * @param {*} props Other props of the component.
 *
 * @returns {ReactElement} The rendered component.
 *
 * @example
 * <MDEPopover direction={"bottom"} nearEdge={"center"}>
 *     <div slot={"default"}>Default content</div>
 *     <div slot={"floating"}>Floating content</div>
 * </MDEPopover>
 */
function MDEPopover({
                        children,
                        direction = "bottom",
                        nearEdge = "center",
                        ...props
                    }) {
    const [isValid, setIsValid] = useState(true);
    const [floatingActive, setFloatingActive] = useState(false);

    const floatingRef = useRef(null);

    /**
     * Default slot contents
     *
     * @type {ReactElement[]}
     */
    const defaultChildren = [];
    /**
     * Floating slot contents
     *
     * @type {ReactElement[]}
     */
    const floatingChildren = [];

    // Judge whether the parameters are correct.
    useEffect(() => {
        const displayName = MDEPopover.displayName || MDEPopover.name;

        const validDirections = new Set(["top", "bottom", "left", "right"]);
        const validNearEdges = new Set(["top", "bottom", "left", "right", "center"]);

        const errors = [];
        if (!validDirections.has(direction)) {
            errors.push(`Invalid direction: ${direction}`);
        }
        if (!validNearEdges.has(nearEdge)) {
            errors.push(`Invalid nearEdge: ${nearEdge}`);
        }

        if (errors.length > 0) {
            errors.forEach(error => logger.error(`[${displayName}] ${error}`));
            setIsValid(false);
            return;
        }

        // Use mapping objects to refine conflict verdicts
        // If the direction is "top" or "bottom", then the nearEdge cannot be "top" or "bottom"
        // If the direction is "left" or "right", then the nearEdge cannot be "left" or "right"
        const invalidEdgeMap = {
            top: new Set(["top", "bottom"]),
            bottom: new Set(["top", "bottom"]),
            left: new Set(["left", "right"]),
            right: new Set(["left", "right"])
        };

        if (invalidEdgeMap[direction].has(nearEdge)) {
            logger.error(`[${displayName}] Invalid nearEdge: ${nearEdge}`);
            setIsValid(false);
        }
    }, [direction, nearEdge]);

    // Click Listen globally
    useEffect(() => {
        if (floatingActive) {
            const handleDocumentClick = (event) => {
                // Check if the click target is outside the floating element
                if (floatingRef.current && !floatingRef.current.contains(event.target)) {
                    setFloatingActive(false);
                }
            };

            document.addEventListener("click", handleDocumentClick);
            return () => document.removeEventListener("click", handleDocumentClick);
        }
    }, [floatingActive]);

    // If the parameters do not meet the requirements, the component is not allowed to be rendered.
    if (!isValid) {
        return null;
    }

    // Assign the children position
    React.Children.forEach(children, (child = {}) => {
        if (React.isValidElement(child)) {
            if (child.props.slot === "floating") {
                floatingChildren.push(child);
            } else {
                defaultChildren.push(child);
            }
        }
    });

    function handleClick() {
        setFloatingActive(!floatingActive);
    }

    return (
        <div className={`mde-popover ${props.className || ""}${floatingActive ? " active" : ""}`}
             data-direction={direction}
             data-near-edge={nearEdge}
             ref={floatingRef}
             {...props}>
            {
                React.Children.map(defaultChildren, child => {
                    if (!React.isValidElement(child)) {
                        return child;
                    }

                    return React.cloneElement(child, {
                        onClick: (e) => {
                            // Execute the original click event first.
                            if (typeof child.props.onClick === "function") {
                                child.props.onClick(e);
                            }

                            // Then execute the click event of the popover component.
                            handleClick();
                        }
                    });
                })
            }
            <div className={"mde-popover__floating"}>{floatingChildren}</div>
        </div>
    );
}

export default MDEPopover;