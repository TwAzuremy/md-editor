import "@components/css/mde-folder.scss";

import MDEButton from "@components/MDEButton.jsx";
import { useRef, useState, useCallback, memo, useEffect, useMemo } from "react";
import IconLoader from "@components/IconLoader.jsx";
import MDEFile from "@components/MDEFile.jsx";
import { useTemp } from "@renderer/provider/TempProvider.jsx";

/**
 * folder component, used to display a folder and its contents
 *
 * @param {Object} props component properties
 * @param {string} props.dirPath path to folder
 * @param {string} props.name folder name
 * @param {boolean} [props.showTwigs=true] is show the twigs or not
 * @returns {React.ReactElement} rendered element
 */
const MDEFolder = memo(({
    dirPath,
    name,
    showTwigs = true,
    ...props
}) => {
    const [fileList, setFileList] = useState([]);
    const [isDragOver, setIsDragOver] = useState(false);
    const fullPath = useMemo(() => dirPath + "\\" + name, [dirPath, name]);

    const folderEl = useRef(null);

    const { getTemp, setTemp } = useTemp();

    // Listen for temporary values.
    const taggedFolderPath = useMemo(() => getTemp("tagged-folder"), [getTemp]);

    const openAndCloseFolder = useCallback(async () => {
        setTemp("tagged-folder", fullPath);
        morph();

        if (fileList.length) {
            setFileList([]);

            return;
        }

        const list = await window.explorer.readDirectory(fullPath, false);
        setFileList(list);
    }, [fullPath, fileList]);

    /**
     * Morphs the folder icon.
     *
     * @private
     */
    function morph() {
        const svg = folderEl.current.querySelector("&>.mde-button svg");
        const folder = svg.querySelector(".folder");
        const white = svg.querySelector(".white");

        const hasActive = folderEl.current.classList.contains("active");
        folderEl.current.classList.toggle("active", !hasActive);
        const state = !hasActive ? "Open" : "Close";

        folder.setAttribute("d", svg.dataset[`folder${state}`]);
        white.setAttribute("d", svg.dataset[`white${state}`]);
    }

    // Handle drag start events
    const handleDragStart = (e) => {
        console.log('MDEFolder - handleDragStart', fullPath);
        // 设置拖拽数据
        e.dataTransfer.setData("text/plain", fullPath);
        e.dataTransfer.setData("application/json", JSON.stringify({
            type: "directory",
            path: fullPath
        }));
        e.dataTransfer.effectAllowed = "move";
    };

    // Handle drag over events
    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        e.dataTransfer.dropEffect = "move";
        setIsDragOver(true);
    };

    // Handle drag leave events
    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
    };

    // handle drag over events
    const handleDrop = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);

        try {
            // get the source path and type
            const sourcePath = e.dataTransfer.getData("text/plain");
            const sourceData = JSON.parse(e.dataTransfer.getData("application/json"));
            console.log('MDEFolder - handleDrop', 'source:', sourcePath, 'target:', fullPath);

            // call the moveFileOrFolder function
            console.log('MDEFolder - 调用moveFileOrFolder', sourcePath, fullPath);
            // 路径校验防止循环移动
            // if (sourceData.path.startsWith(fullPath)) {
            //     console.error('不能移动到自身子目录');
            //     return;
            // }

            // 创建临时目录路径
            if (!window.path || !window.path.join) {
                console.error('path module not available');
                return;
            }
            const tempDir = await window.path.join(await window.os.tmpdir(), 'mde_temp_move');
            
            // 第一阶段：移动到临时目录
            const tempResult = await window.explorer.moveFileOrFolder(sourcePath, tempDir);
            if (!tempResult.success) {
                console.error('临时移动失败:', tempResult.error);
                return;
            }

            // 第二阶段：从临时目录移动到目标位置
            const tempPath = await window.path.join(tempDir, await window.path.basename(sourcePath));
            const finalResult = await window.explorer.moveFileOrFolder(tempPath, fullPath);
            console.log('MDEFolder - moveFileOrFolder结果', finalResult);

            if (finalResult.success) {
                // 更新文件列表
                if (fileList.length > 0) {
                    const list = await window.explorer.readDirectory(fullPath, false);
                    setFileList(list);
                }
                // 触发全局刷新
                window.dispatchEvent(new CustomEvent('refresh-explorer'));
            } else {
                // 回滚操作：将文件移回原位置
                await window.explorer.moveFileOrFolder(tempPath, await window.path.dirname(sourcePath));
                console.error("最终移动失败:", finalResult.error);
            }
        } catch (error) {
            console.error("处理拖放操作时出错:", error);
        }
    };

    const renderFileItem = useCallback((file, index) => {
        const key = file.name + file.type + index;
        const commonProps = {
            dirPath: fullPath,
            name: file.name,
            // 确保子项能够正确继承拖拽功能
            draggable: true,
            // 传递所有拖拽相关的props以确保嵌套子目录也能正确支持拖拽
            ...props
        };

        if (file.type === "directory") {
            return <MDEFolder key={key} {...commonProps} />;
        } else if (file.type === "file") {
            return <MDEFile key={key} {...commonProps} />;
        }
        return null;
    }, [fullPath, props]);

return (
    <div className={`mde-folder ${isDragOver ? "drag-over" : ""}`}
        {...props}
        ref={folderEl}
        draggable={true}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}>
        {showTwigs && <IconLoader name={"twig"} className={"twig"} />}
        {showTwigs && <div className={"trunk"}></div>}
        <MDEButton
            icon={<IconLoader name={"folder"} />}
            text={name}
            active={taggedFolderPath === fullPath}
            onClick={openAndCloseFolder} />
        {
            fileList.length !== 0 &&
            <div className={"mde-folder__file-list"}>
                {fileList.map((file, index) => renderFileItem(file, index))}
            </div>
        }
    </div>
);
});

export default MDEFolder;