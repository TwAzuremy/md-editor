/**
 * Utility functions for handling drag and drop operations in the file explorer
 */

import { logger } from "@utils/Logger.js";

/**
 * Handles external file drop events
 *
 * @param {DragEvent} event - The drop event containing external files
 * @param {string} targetPath - The path where the files should be copied to
 * @returns {Promise<void>}
 */
export async function handleExternalFileDrop(event, targetPath) {
    const files = event.dataTransfer.files;
    if (files.length === 0) {
        return;
    }

    logger.info(`[DragDrop] Handling ${files.length} external files dropped to ${targetPath}`);

    // Process each dragged file
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const filePath = file.path;

        if (!filePath) {
            logger.warn(`[DragDrop] File at index ${i} has no path`);
            continue;
        }

        try {
            // For external files, we should copy instead of move
            // Pass the third parameter as true to indicate this is a copy operation
            const result = await window.explorer.moveFileOrFolder(filePath, targetPath, true);

            if (result.success) {
                logger.info(`[DragDrop] Successfully copied external file: ${filePath} to ${targetPath}`);
            } else {
                logger.warn(`[DragDrop] Failed to copy external file: ${filePath}`, result.error);
            }
        } catch (error) {
            logger.error(`[DragDrop] Error copying external file: ${filePath}`, error);
        }
    }
}

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
            return { isValid: false, message: "Source and target paths are the same" };
        }

        // If source directory and target directory are the same, prevent operation
        if (sourceDir === targetPath) {
            return { isValid: false, message: "Source and target directories are the same" };
        }

        // For directories, prevent moving to own subdirectory
        if (sourceData.type === "directory" && targetPath.startsWith(sourcePath + "\\")) {
            logger.warn("[DragDrop] Cannot move a folder to its own subdirectory");
            return { isValid: false, message: "Cannot move a folder to its own subdirectory" };
        }

        return { isValid: true };
    } catch (error) {
        logger.error("Error in drag and drop validation:", error);
        return { isValid: false, message: error.message };
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

    // If target path is empty, do not process drag and drop operation
    if (!targetPath) {
        logger.warn("[DragDrop] Target path is empty");
        return;
    }

    try {
        // Check if it's an external file drag
        if (event.dataTransfer.files.length > 0) {
            // Handle external file drag
            await handleExternalFileDrop(event, targetPath);
            return;
        }

        // Handle internal file drag
        const sourcePath = event.dataTransfer.getData("text/plain");
        // If there's no sourcePath, it might be an external drag but without files
        if (!sourcePath) {
            logger.warn("[DragDrop] No source path found in drag data");
            return;
        }

        // Check if application/json data exists to avoid JSON parsing errors
        const jsonData = event.dataTransfer.getData("application/json");
        if (!jsonData) {
            logger.warn("[DragDrop] No JSON data found in drag data");
            return;
        }

        const sourceData = JSON.parse(jsonData);

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
