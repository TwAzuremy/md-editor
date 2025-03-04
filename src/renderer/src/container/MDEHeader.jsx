import "@renderer/container/css/mde-header.scss";
import WindowController from "@components/WindowController.jsx";

function MDEHeader() {
    return (
        <header id={"mde-header"}>
            <WindowController />
        </header>
    )
}

export default MDEHeader;