import StorageLogger from './StorageLogger'
import BaseStorageWorker from './services/BaseStorageWorker'
import LocalStorageWorker from './services/LocalStorageWorker'

export type * from './types'
export * from './enum'

// Export storage workers so users can import them
export {
    BaseStorageWorker,
    LocalStorageWorker
}
export type { DebugLogFunction, StorageWorkerConstructor } from './services/BaseStorageWorker'

export default StorageLogger
