import {lazy, Suspense} from "react";

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
const IconLoader = ({name, ...props}) => {
    const Icon = lazy(() => import(`@assets/icons/${name}.svg?react`));

    return (
        <Suspense fallback={null}>
            <Icon {...props} />
        </Suspense>
    );
};

export default IconLoader;