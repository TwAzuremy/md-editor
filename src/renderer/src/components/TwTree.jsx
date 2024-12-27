import "./css/TwTree.scss";

import TwButton from "@components/TwButton.jsx";
import TwIconLoader from "@components/TwIconLoader.jsx";
import React from "react";
import {CSSTransition} from "react-transition-group";

const testDirectory = [
    {
        "name": "timeOfDay",
        "children": [
            {
                "name": "css",
                "children": [
                    {
                        "name": "timeOfDay.css"
                    }
                ]
            },
            {
                "name": "index.html"
            },
            {
                "name": "js",
                "children": [
                    {
                        "name": "jquery-3.5.1.min.js"
                    },
                    {
                        "name": "timeOfDay.js"
                    }
                ]
            },
            {
                "name": "timeOfDay",
                "children": [
                    {
                        "name": "Test File"
                    }
                ]
            }
        ]
    },
    {
        "name": "typewriter",
        "children": [
            {
                "name": "css",
                "children": [
                    {
                        "name": "typewriter.css"
                    },
                    {
                        "name": "typewriter.scss"
                    }
                ]
            },
            {
                "name": "index.html"
            }
        ]
    },
    {
        "name": "test file.md"
    }
];

function getCSSVariable(variableName) {
    return getComputedStyle(document.documentElement).getPropertyValue(variableName).trim();
}

function convertCSSVariableToNumber(variableName) {
    function convertToNumber(value) {
        return parseFloat(value);
    }

    const value = getCSSVariable(variableName);

    if (value.endsWith("s")) {
        return convertToNumber(value);
    }

    if (value.endsWith("ms")) {
        return convertToNumber(value) / 1000;
    }

    return convertToNumber(value);
}

function TwTree({
                    data = testDirectory,
                    className = "",
                    ...props
                }) {

    return (
        <div className={"tw-tree " + (className || "")} {...props}>
            {data.map((info, index) => <TwTreeElement key={info.name + index + Math.random()} fileInfo={info}/>)}
        </div>
    );
}

function TwTreeElement({fileInfo}) {
    const [expandedDirs, setExpandedDirs] = React.useState([]);
    const ref = React.useRef(null);

    const animationDelay = convertCSSVariableToNumber(getCSSVariable("--tw-animation-delay")) || 200;

    function handleClick(path, event) {
        const children = event.currentTarget.parentElement.nextElementSibling;
        const isExpanded = children.classList.toggle("tw-tree__children-expanded");

        if (isExpanded) {
            rendering(path);
        } else {
            setTimeout(() => {
                setExpandedDirs([]);
            }, animationDelay);
        }
    }

    function rendering(path) {
        // TODO: Replace with real fs module loading.
        const list = path.children;

        const elements = list.map((info, index) => (
            <TwTreeElement key={info.name + index + Math.random()} fileInfo={info}/>
        ));

        setExpandedDirs(elements);
    }

    const hasChildren = !!fileInfo?.children;

    return (
        <div className={"tw-tree__element"} data-is-folder={hasChildren}>
            <div className={"tw-tree__name"} data-file-type={hasChildren ? "folder" : "file"}>
                <TwButton background={"transparent"}
                          onClick={hasChildren ? handleClick.bind(this, fileInfo) : null}>
                    {
                        hasChildren ?
                            <TwIconLoader name={"folder-face"}/> :
                            <TwIconLoader name={"file"}/>
                    }
                    <span>{fileInfo.name}</span>
                </TwButton>
                <TwIconLoader className={"tw-tree__twigs"} name={"twigs"}/>
            </div>
            {
                hasChildren &&
                <div className={"tw-tree__children"}>
                    <CSSTransition in={expandedDirs.length !== 0}
                                   classNames="tree-children-fade"
                                   timeout={animationDelay}
                                   nodeRef={ref}>
                        <div className={"tw-tree__children__container"} ref={ref}>
                            {expandedDirs}
                        </div>
                    </CSSTransition>
                </div>
            }
        </div>
    );
}

export default TwTree;