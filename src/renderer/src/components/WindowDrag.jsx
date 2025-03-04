import "@components/css/window-drag.scss";

/**
 * A component that can be used to drag a window.
 *
 * @param {*} props The component props.
 * @param {string} direction="horizontal" The direction of dragging.
 *
 * @returns {ReactElement} A div with class "window-drag" and data-direction attribute.
 *
 * @example
 * <WindowDrag direction={"horizontal"}/>
 */
function WindowDrag({direction = "horizontal"}) {
    return (
        <div className={"window-drag"} data-direction={direction}></div>
    );
}

export default WindowDrag;