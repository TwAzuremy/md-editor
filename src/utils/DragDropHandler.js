/**
 * Utility functions for handling drag and drop operations in the file explorer
 */

import {logger} from "@utils/Logger.js";

/**
 * Validates if a drag and drop operation is allowed between the source and target paths
 *
 * @param {string} sourcePath - The path of the source item being dragged
 * @param {string} targetPath - The path of the target location
 * @param {Object} sourceData - The metadata of the source item
 * @returns {Object} - Object containing validation result and any error message
 */
export function validateDragDrop(sourcePath, targetPath, sourceData) {
    try {
        // Get source directory path
        const sourceDir = sourcePath.substring(0, sourcePath.lastIndexOf("\\"));

        // If source and target are the same, prevent operation
        if (sourcePath === targetPath) {
            return {isValid: false, message: "Source and target paths are the same"};
        }

        // If source directory and target directory are the same, prevent operation
        if (sourceDir === targetPath) {
            return {isValid: false, message: "Source and target directories are the same"};
        }

        // For directories, prevent moving to own subdirectory
        if (sourceData.type === "directory" && targetPath.startsWith(sourcePath + "\\")) {
            logger.warn("[DragDrop] Cannot move a folder to its own subdirectory");
            return {isValid: false, message: "Cannot move a folder to its own subdirectory"};
        }

        return {isValid: true};
    } catch (error) {
        logger.error("Error in drag and drop validation:", error);
        return {isValid: false, message: error.message};
    }
}

/**
 * Handles the drag over event
 *
 * @param {DragEvent} event - The drag over event
 * @param {Function} setDragOver - Function to update drag over state
 */
export function handleDragOver(event, setDragOver) {
    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.dropEffect = "move";
    setDragOver?.(true);
}

/**
 * Handles the drag leave event
 *
 * @param {DragEvent} event - The drag leave event
 * @param {Function} setDragOver - Function to update drag over state
 */
export function handleDragLeave(event, setDragOver) {
    event.preventDefault();
    event.stopPropagation();
    setDragOver?.(false);
}

/**
 * Handles the drop event for files and folders
 *
 * @param {DragEvent} event - The drop event
 * @param {string|null} targetPath - The path where the item is being dropped
 * @param {Function} setDragOver - Function to update drag over state
 * @returns {Promise<void>}
 */
export async function handleDrop(event, targetPath, setDragOver) {
    event.preventDefault();
    event.stopPropagation();
    setDragOver?.(false);

    try {
        const sourcePath = event.dataTransfer.getData("text/plain");
        const sourceData = JSON.parse(event.dataTransfer.getData("application/json"));

        const validation = validateDragDrop(sourcePath, targetPath, sourceData);
        if (!validation.isValid) {
            logger.warn("[DragDrop] Validation failed:", validation.message);
            return;
        }

        const result = await window.explorer.moveFileOrFolder(sourcePath, targetPath);
        if (!result.success) {
            logger.warn("[DragDrop] Move operation failed:", result.error);
        }
    } catch (error) {
        logger.error("Error handling drag and drop operation:", error);
    }
}