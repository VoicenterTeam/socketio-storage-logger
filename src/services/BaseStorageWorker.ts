/**
 * Type for the debug logging function that will be passed to storage workers
 */
export type DebugLogFunction = (message: string, ...data: unknown[]) => void

/**
 * Alternative type if you want to be more strict about additional parameters
 */
export type StorageWorkerConstructor = new (debugLog: DebugLogFunction) => BaseStorageWorker

/**
 * Abstract base class for storage workers that provides a consistent interface
 * for different storage backends (localStorage, IndexedDB, Redis, remote storage, etc.).
 *
 * All storage operations are async to support both synchronous and asynchronous
 * storage implementations. For synchronous storage (like localStorage), the
 * async functions will automatically wrap return values in Promises.
 *
 * @abstract
 * @example
 * ```typescript
 * // Implementation for localStorage
 * class LocalStorageWorker extends BaseStorageWorker {
 *   // Debug logging function, the StorageLogger will pass its function here, it can be used for debugging purposes
 *   constructor(debugLog: DebugLogFunction) {
 *      super(debugLog)
 *   }
 *
 *   async getItem(key: string): Promise<string | null> {
 *     // Example debug log usage
 *     this.debugLog(`[LocalStorage] Getting item for key: ${key}`)
 *
 *     return localStorage.getItem(key) // async automatically wraps in Promise
 *   }
 *
 *   async setItem(key: string, value: string): Promise<void> {
 *     localStorage.setItem(key, value) // no return needed for void
 *   }
 *
 *   async removeItem(key: string): Promise<void> {
 *     localStorage.removeItem(key)
 *   }
 *
 *   async getAllKeys(): Promise<string[]> {
 *     return Object.keys(localStorage)
 *   }
 * }
 * ```
 */
export default abstract class BaseStorageWorker {
    /**
     * @param debugLog - Debug logging function. If not provided, debugging is disabled.
     */
    protected constructor (
        protected debugLog: DebugLogFunction
    ) {}

    /**
     * Retrieves an item from storage by its key.
     *
     * @param key - The unique identifier for the stored item
     * @returns A promise that resolves to the stored value as a string, or null if the key doesn't exist
     *
     * @example
     * ```typescript
     * const value = await storageWorker.getItem('user-settings')
     * if (value !== null) {
     *   const settings = JSON.parse(value)
     *   // Use settings...
     * }
     * ```
     */
    abstract getItem(key: string): Promise<string | null>

    /**
     * Stores an item in storage with the specified key.
     * If the key already exists, the value will be overwritten.
     *
     * @param key - The unique identifier for the item to store
     * @param value - The string value to store (use JSON.stringify for objects)
     * @returns A promise that resolves when the item has been successfully stored
     * @throws {Error} May throw if storage quota is exceeded or storage is unavailable
     *
     * @example
     * ```typescript
     * const settings = { theme: 'dark', language: 'en' }
     * await storageWorker.setItem('user-settings', JSON.stringify(settings))
     * ```
     */
    abstract setItem(key: string, value: string): Promise<void>

    /**
     * Removes an item from storage by its key.
     * If the key doesn't exist, this operation should complete successfully without error.
     *
     * @param key - The unique identifier of the item to remove
     * @returns A promise that resolves when the item has been successfully removed
     *
     * @example
     * ```typescript
     * await storageWorker.removeItem('temporary-data')
     * ```
     */
    abstract removeItem(key: string): Promise<void>

    /**
     * Retrieves all keys currently stored in the storage.
     * This is useful for operations like cleanup, migration, or listing stored items.
     *
     * @returns A promise that resolves to an array of all keys in storage
     *
     * @example
     * ```typescript
     * const keys = await storageWorker.getAllKeys()
     * console.log(`Found ${keys.length} items in storage:`, keys)
     *
     * // Remove all items older than a certain date
     * const oldKeys = keys.filter(key => key.startsWith('log-2023-'))
     * for (const key of oldKeys) {
     *   await storageWorker.removeItem(key)
     * }
     * ```
     */
    abstract getAllKeys(): Promise<string[]>
}
