import "@components/css/mde-file.scss";

import MDEButton from "@components/MDEButton.jsx";
import IconLoader from "@components/IconLoader.jsx";

function MDEFile({dirPath, name, showTwigs = true, ...props}) {
    return (
        <div className={"mde-file"} {...props}>
            {showTwigs && <IconLoader name={"twig"} className={"twig"}/>}
            {showTwigs && <div className={"trunk"}></div>}
            <MDEButton icon={<IconLoader name={"file"}/>} text={name}/>
        </div>
    );
}

export default MDEFile;