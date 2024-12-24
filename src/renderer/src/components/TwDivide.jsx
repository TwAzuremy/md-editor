import "./css/TwDivide.scss";

function TwDivide({direction = "horizontal", margin = 0, ...props}) {
    return (
        <div className={"tw-divide"} style={{ "--tw-divide-margin": margin + "px" }}
             data-direction={direction} {...props}>
            <div className={"tw-divide__line"}></div>
        </div>
    );
}

export default TwDivide;