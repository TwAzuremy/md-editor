import "@components/css/mde-file.scss";

import MDEButton from "@components/MDEButton.jsx";
import IconLoader from "@components/IconLoader.jsx";
import { memo, useMemo, useState } from "react";
import path from "path";

/**
 * File component, used to display directory items
 *
 * @param {Object} props component attributes
 * @param {string} props.dirPath directory path
 * @param {string} props.name file name
 * @param {boolean} [props.showTwigs=true] show Twigs or not
 * @returns {React.ReactElement} rendered element
 */
const MDEFile = memo(({dirPath, name, showTwigs = true, ...props}) => {
    const fullPath = useMemo(() => dirPath + "\\" + name, [dirPath, name]);
    const [isDragOver, setIsDragOver] = useState(false);

    // 处理拖拽开始事件
    const handleDragStart = (e) => {
        console.log('MDEFile - handleDragStart', fullPath);
        // 设置拖拽数据
        e.dataTransfer.setData("text/plain", fullPath);
        e.dataTransfer.setData("application/json", JSON.stringify({
            type: "file",
            path: fullPath
        }));
        e.dataTransfer.effectAllowed = "move";
    };

    // 处理拖拽经过事件
    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();

        // 设置拖拽效果
        e.dataTransfer.dropEffect = "move";
        setIsDragOver(true);
    };

    // 处理拖拽离开事件
    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
    };

    // 处理放置事件
    const handleDrop = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);

        try {
            // 获取源路径和类型
            const sourcePath = e.dataTransfer.getData("text/plain");
            const sourceData = JSON.parse(e.dataTransfer.getData("application/json"));
            console.log('MDEFile - handleDrop', 'source:', sourcePath, 'target dir:', dirPath);

            // 如果源与目标相同，则不执行操作
            // if (sourcePath === fullPath) {
            //     console.log('MDEFile - handleDrop - 源与目标相同，取消操作');
            //     return;
            // }

            // 获取目标路径（文件所在的目录）
            const targetDir = dirPath;

            // 调用移动文件或文件夹的函数
            console.log('MDEFile - 调用moveFileOrFolder', sourcePath, targetDir);
            // 路径校验防止循环移动
            if (sourceData.path.startsWith(targetDir)) {
                console.error('不能移动到自身子目录');
                return;
            }

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
            const finalResult = await window.explorer.moveFileOrFolder(tempPath, targetDir);
            console.log('MDEFile - moveFileOrFolder结果', finalResult);

            if (finalResult.success) {
                // 通知父组件刷新文件列表
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

    return (
        <div className={`mde-file ${isDragOver ? "drag-over" : ""}`}
            {...props}
            draggable={true}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}>
            {showTwigs && <IconLoader name="twig" className="twig"/>}
            {showTwigs && <div className="trunk"></div>}
            <MDEButton icon={<IconLoader name="file"/>} text={name}/>
        </div>
    );
});

export default MDEFile;
