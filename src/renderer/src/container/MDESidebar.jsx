import "@renderer/container/css/mde-sidebar.scss";

import React, {memo} from "react";

/**
 * A sidebar component for markdown-editor.
 *
 * @function MDESidebar
 *
 * @param {null|string} renderId=null The id of the page to render.
 * @param {[{id: string, component: ReactElement}]} [pageList=[]] A list of information in the sidebar.
 *
 * @returns {ReactElement} The rendered component.
 *
 * @example
 * <MDESidebar renderId="test" pageList={[{...}, ...]} />
 */
const MDESidebar = memo(({renderId = null, pageList = []}) => {
    return (
        <aside id={"mde-sidebar"}>
            {
                pageList.map(({id, component}) => {
                    return id === renderId && React.cloneElement(component, {key: id});
                })
            }
        </aside>
    );
});

export default MDESidebar;