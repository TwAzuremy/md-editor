import React, {lazy, memo, Suspense} from "react";

const iconCache = {};

/**
 * A function component that loads an SVG icon by name.
 *
 * @function IconLoader
 *
 * @param {string} name The name of the icon to load.
 * @param {*} [props] Any additional props to be passed to the icon component.
 *
 * @returns {ReactElement} A React element representing the loaded icon component.
 *
 * @example
 * <IconLoader name={"icon-name"}/>
 */
const IconLoader = memo(({name, ...props}) => {
    // Get the icon component from the cache.
    let Icon = iconCache[name];

    // If not, the icon is imported, and stored in the cache.
    if (!Icon) {
        Icon = lazy(() => import(`@assets/icons/${name}.svg?react`));
        iconCache[name] = Icon;
    }

    return (
        <Suspense fallback={null}>
            <Icon {...props} />
        </Suspense>
    );
});

export default IconLoader;