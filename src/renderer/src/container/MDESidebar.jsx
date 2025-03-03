import "@renderer/container/css/mde-sidebar.scss";

function MDESidebar({renderId = null}) {
    return (
        <aside id={"mde-sidebar"}>
            {/* TODO: [Deleted] Here is the test case. */}
            {renderId === "file-manager" && <span>File Manager</span>}
            {renderId === "test" && <span>Test</span>}
        </aside>
    )
}

export default MDESidebar;