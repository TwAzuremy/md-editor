import "@components/css/mde-input.scss";

import IconLoader from "@components/IconLoader.jsx";
import MDEButton from "@components/MDEButton.jsx";
import {useRef, useCallback, memo} from "react";

/**
 * Input Component
 * 
 * @param {Object} props component properties
 * @param {React.ReactElement} [props.icon] input icon
 * @returns {React.ReactElement} rendered element
 */
const MDEInput = memo(({
    icon,
    ...props
}) => {
    const inputEl = useRef(null);

    const clear = useCallback(() => {
        if (inputEl.current) {
            inputEl.current.value = "";
            inputEl.current.focus();
        }
    }, []);

    return (
        <div className="mde-input">
            {icon && <div className="mde-input__icon">{icon}</div>}
            <input className="mde-input__input" {...props} ref={inputEl}/>
            <MDEButton className="mde-input__clear"
                    icon={<IconLoader name="close"/>}
                    onClick={clear}/>
        </div>
    );
});

export default MDEInput;