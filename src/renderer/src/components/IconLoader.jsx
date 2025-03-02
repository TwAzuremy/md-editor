import {lazy, Suspense} from "react";

const IconLoader = ({name, ...props}) => {
    const Icon = lazy(() => import(`@assets/icons/${name}.svg?react`));

    return (
        <Suspense fallback={null}>
            <Icon {...props} />
        </Suspense>
    );
};

export default IconLoader;