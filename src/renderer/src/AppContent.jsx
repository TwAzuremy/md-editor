import "@assets/css/appContent.scss";
import TwTooltips from "@components/TwTooltips.jsx";
import TwButton from "@components/TwButton.jsx";
import TwDivide from "@components/TwDivide.jsx";

function AppContent() {
    return (
        <div id={"app__content"}>
            <TwTooltips
                triggerEl={
                    <TwButton background={"transparent"} transition={true}>
                        <p>Bubble Test Button</p>
                    </TwButton>
                }
                direction={"bottom"}
                text={"Hello World"}
                trigger={"hover"}/>
            <TwDivide />
        </div>
    );
}

export default AppContent;