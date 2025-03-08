import React, {lazy, memo, Suspense, useMemo} from "react";

// 使用全局缓存以避免重复导入
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
    const Icon = useMemo(() => {

        if (iconCache[name]) {
            return iconCache[name];
        }
        
        const ImportedIcon = lazy(() => import(`@assets/icons/${name}.svg?react`));
        iconCache[name] = ImportedIcon;
        return ImportedIcon;
    }, [name]); // Recalculate only when name changes

    return (
        <Suspense fallback={null}>
            <Icon {...props} />
        </Suspense>
    );
});

export default IconLoader;