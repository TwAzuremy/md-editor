import "@renderer/container/css/mde-header.scss";
import WindowController from "@components/WindowController.jsx";

function MDEHeader() {
    return (
        <header id={"mde-header"}>
            <div className="_blank"></div>
            <WindowController />
        </header>
    )
}

export default MDEHeader;