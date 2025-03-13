import React, {lazy, memo, Suspense, useEffect, useMemo} from "react";

// Use a global cache to avoid duplicate imports
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
const IconLoader = memo(({name, onLoad, ...props}) => {
    const Icon = useMemo(() => {
        // Get the icon component from the cache.
        if (iconCache[name]) {
            return iconCache[name];
        }

        // If not, the icon is imported, and stored in the cache.
        const ImportedIcon = lazy(() => import(`@assets/icons/${name}.svg?react`));
        iconCache[name] = ImportedIcon;

        return ImportedIcon;
    }, [name]);

    useEffect(() => {
        if (onLoad) {
            onLoad();
        }
    }, [onLoad]);

    return (
        <Suspense fallback={null}>
            <Icon {...props} />
        </Suspense>
    );
});

export default IconLoader;