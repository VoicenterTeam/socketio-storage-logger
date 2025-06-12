import BaseStorageWorker, { DebugLogFunction } from './BaseStorageWorker'

export default class LocalStorageWorker extends BaseStorageWorker {
    constructor (debugLog: DebugLogFunction) {
        super(debugLog)
    }

    async getItem (key: string): Promise<string | null> {
        this.debugLog(`[LocalStorage] Getting item for key: ${key}`)

        try {
            const result = localStorage.getItem(key)
            this.debugLog(`[LocalStorage] Get result for key ${key}:`, result)

            return result
        } catch (error) {
            this.debugLog(`[LocalStorage] Error getting item for key ${key}:`, error)
            throw error
        }
    }

    async setItem (key: string, value: string): Promise<void> {
        this.debugLog(`[LocalStorage] Setting item for key: ${key}`)
        this.debugLog(`[LocalStorage] Value length: ${value.length} characters`)

        try {
            localStorage.setItem(key, value)
            this.debugLog(`[LocalStorage] Successfully set item for key: ${key}`)
        } catch (error) {
            this.debugLog(`[LocalStorage] Error setting item for key ${key}:`, error)
            throw error
        }
    }

    async removeItem (key: string): Promise<void> {
        this.debugLog(`[LocalStorage] Removing item for key: ${key}`)

        try {
            localStorage.removeItem(key)
            this.debugLog(`[LocalStorage] Successfully removed item for key: ${key}`)
        } catch (error) {
            this.debugLog(`[LocalStorage] Error removing item for key ${key}:`, error)
            throw error
        }
    }

    async getAllKeys (): Promise<string[]> {
        this.debugLog('[LocalStorage] Getting all keys')

        try {
            const keys = Object.keys(localStorage)
            this.debugLog(`[LocalStorage] Found ${keys.length} keys`)

            return keys
        } catch (error) {
            this.debugLog('[LocalStorage] Error getting all keys:', error)
            throw error
        }
    }
}

