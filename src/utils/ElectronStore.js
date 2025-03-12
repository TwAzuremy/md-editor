import {logger} from "@utils/Logger.js";

class ElectronStore {
    static PRIMARY_KEY = "md-editor";
    static KEY_WORKSPACE = ElectronStore.PRIMARY_KEY + ".workspace";
    static KEY_WORKSPACE_RECENT = ElectronStore.PRIMARY_KEY + ".workspace-recent";

    // Temporarily stored keys
    static KEY_TAGGED_FOLDER = "tagged-folder";

    /**
     * Retrieves a value from the store by key.
     *
     * @param {string} key - The key of the value to retrieve.
     * @param {*} [defaultValue=null] - The default value to return if the key is not found.
     *
     * @returns {Promise<*>} - The value associated with the key, or the default value.
     */
    static async get(key, defaultValue = null) {
        try {
            const value = await window.store.get(key);

            return value !== void 0 ? value : defaultValue;
        } catch (err) {
            logger.warn(`[Store Error] Get "${key}" failed:`, err);

            return defaultValue;
        }
    }

    /**
     * Sets a value in the store with the specified key.
     *
     * @param {string} key - The key to associate with the value.
     * @param {*} value - The value to store.
     *
     * @returns {Promise<boolean>} - True if the operation was successful, false otherwise.
     */
    static async set(key, value) {
        try {
            await window.store.set(key, value);

            return true;
        } catch (err) {
            logger.warn(`[Store Error] Set "${key}" failed:`, err);

            return false;
        }
    }

    /**
     * Deletes a key-value pair from the store by key.
     *
     * @param {string} key - The key to delete.
     *
     * @returns {Promise<boolean>} - True if the operation was successful, false otherwise.
     */
    static async delete(key) {
        try {
            await window.store.del(key);

            return true;
        } catch (err) {
            logger.warn(`[Store Error] Delete "${key}" failed:`, err);

            return false;
        }
    }

    /**
     * Clears all key-value pairs from the store.
     *
     * @returns {Promise<boolean>} - True if the operation was successful, false otherwise.
     */
    static async clear() {
        try {
            await window.store.clr();

            return true;
        } catch (err) {
            logger.warn("[Store Error] Clear failed:", err);

            return false;
        }
    }
}

export default ElectronStore;