import {logger} from "@utils/Logger.js";
import {validateDragDrop} from "@utils/DragDropHandler.js";

export const dragEnd = (event, dirPath, fullPath) => {
    // Set data-is-dragging attribute
    event.currentTarget.setAttribute("data-is-dragging", "true");

    // Add dragend event listener to remove the attribute and handle drop to workspace root
    const handleDragEnd = async (e) => {
        e.currentTarget.removeAttribute("data-is-dragging");
        e.currentTarget.removeEventListener("dragend", handleDragEnd);

        // If dropped outside any valid drop target, move to workspace root
        if (e.dataTransfer.dropEffect === "none") {
            const workspaceRoot = dirPath.split("\\")[0];
            const sourcePath = e.dataTransfer.getData("text/plain");
            const sourceData = JSON.parse(e.dataTransfer.getData("application/json"));

            const validation = validateDragDrop(fullPath, workspaceRoot, sourceData);
            if (!validation.isValid) {
                logger.warn("[DragDrop] Validation failed:", validation.message);
                return;
            }

            // Move to workspace root
            const result = await window.explorer.moveFileOrFolder(fullPath, workspaceRoot);

            if (!result.success) {
                logger.warn("Move to workspace root failed:", result.error);
            }
        }
    };

    event.currentTarget.addEventListener("dragend", handleDragEnd);
    // Prevent browser default drag behavior
    event.stopPropagation();
}