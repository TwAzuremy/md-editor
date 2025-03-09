import "@components/css/mde-file.scss";

import MDEButton from "@components/MDEButton.jsx";
import IconLoader from "@components/IconLoader.jsx";
import { memo } from "react";

/**
 * File component, used to display directory items
 * 
 * @param {Object} props component attributes
 * @param {string} props.dirPath directory path 
 * @param {string} props.name file name
 * @param {boolean} [props.showTwigs=true] show Twigs or not
 * @returns {React.ReactElement} rendered element
 */
const MDEFile = memo(function MDEFile({dirPath, name, showTwigs = true, ...props}) {
    return (
        <div className="mde-file" {...props}>
            {showTwigs && <IconLoader name="twig" className="twig"/>}
            {showTwigs && <div className="trunk"></div>}
            <MDEButton icon={<IconLoader name="file"/>} text={name}/>
        </div>
    );
});

export default MDEFile;