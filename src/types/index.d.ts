import { ManagerOptions, Socket, SocketOptions as IOSocketOptions } from 'socket.io-client'
import {
    LevelEnum,
    LogTypeEnum,
    ActionNameEnum,
    EntityTypeEnum,
    EntityIDEnum,
    IdentityNameEnum,
    IdentityTypeEnum,
    IdentityIDEnum
} from '../enum'

import { StorageWorkerConstructor } from '../services/BaseStorageWorker'

export type Level = typeof LevelEnum[keyof typeof LevelEnum]
export type LogType = typeof LogTypeEnum[keyof typeof LogTypeEnum]
export type ActionKey = keyof typeof ActionNameEnum
export type ActionName = typeof ActionNameEnum[ActionKey]
export type EntityType = typeof EntityTypeEnum[keyof typeof EntityTypeEnum]
export type EntityID = typeof EntityIDEnum[keyof typeof EntityIDEnum]
export type IdentityName = typeof IdentityNameEnum[keyof typeof IdentityNameEnum]
export type IdentityType = typeof IdentityTypeEnum[keyof typeof IdentityTypeEnum]
export type IdentityID = typeof IdentityIDEnum[keyof typeof IdentityIDEnum]

export type SocketOptions = Partial<ManagerOptions & IOSocketOptions>

export interface ConfigOptions {
    /**
     * This defines the initialized socket socket-io connection.
     */
    socket?: Socket

    /**
     * This defines the socket connection url.
     */
    url?: string

    /**
     * This defines the url for https logger requests.
     */
    requestUrl?: string

    /**
     * This defines initializing configuration options for socket-io connection.
     */
    socketOptions?: SocketOptions

    /**
     * This defines the configuration options for logger.
     */
    loggerOptions: LoggerOptions
}

export type ConsoleMethod<T> = (this: Console, ...data: Array<T>) => void //{ (...data: any[]): void; (...data: any[]): void; (message?: any, ...optionalParams: any[]): void } | undefined

export interface LoggerOptions {
    /**
     * This defines if logger should contain default behavior like logging data to console.
     */
    logToConsole: boolean

    /**
     * This defines if the global console object should be overloaded with logger functionality.
     */
    overloadGlobalConsole: boolean

    /**
     * This defines the system namespace for the storage key.
     * This value should be unique across the projects.
     */
    system: string

    /**
     * This defines the interval for sending logs using sockets in milliseconds.
     */
    socketEmitInterval: number

    /**
     * The storage worker class that will be used to store logs.
     *
     * **REQUIRED** - You must provide a storage worker appropriate for your environment.
     *
     * @example
     * ```typescript
     * import StorageLogger, { LocalStorageWorker } from '@voicenter-team/socketio-storage-logger'
     *
     * // ✅ Browser environment with localStorage
     * const logger = new StorageLogger({
     *   loggerOptions: {
     *     system: 'MyApp',
     *     storageWorker: LocalStorageWorker
     *   }
     * })
     *
     * // ✅ Node.js environment with custom storage
     * class FileSystemStorageWorker extends BaseStorageWorker {
     *   constructor(debugLog: DebugLogFunction) {
     *     super(debugLog)
     *   }
     *   // ... implement with fs operations
     * }
     *
     * const logger = new StorageLogger({
     *   loggerOptions: {
     *     system: 'MyApp',
     *     storageWorker: FileSystemStorageWorker
     *   }
     * })
     * ```
     */
    storageWorker: StorageWorkerConstructor

    /**
     * The level of the logger.
     * If not provided, the default level is 'debug'.
     * Filters which logs will be sent to the server.
     *
     * - If "debug" is set, all logs will be sent.
     * - If "info" is set, only info, warning and error logs will be sent.
     * - If "warning" is set, only warning and error logs will be sent.
     * - If "error" is set, only error logs will be sent.
     */
    loggerLevel?: Level

    /**
     * A static object that can optionally hold partial logger data.
     * The data set here will be sent in each log if not overridden by log data.
     */
    staticObject?: LoggerDataPartial

    /**
     * A prefix to be added to local debug logs
     */
    debugPrefix?: string
}

export interface LoggerBaseData {
    DateTime: Date
    System: string
    UserAgent?: string
    OSVersion?: string
}

export interface LoggerMainParameters {
    Subsystem: string
    TopDistributorID?: string
    IdentityType?: IdentityType
    IdentityID?: IdentityID
    IdentityName: IdentityName
    EntityID?: EntityID
    EntityType?: EntityType
    Message: string
    ActionName?: ActionName
    isShowClient?: boolean
    Status?: string
    StatusCode?: number
    RequestID?: string
    LogType?: LogType
    Level?: Level
    ForwardedIP?: string
    DestinationIP?: string
    Host?: string
    ServerName?: string
    Body?: string | Record<string, unknown>
    ActionID?: number
    Version?: string
    MachineName?: string
    SIPUser?: string
    Response?: string
    Method?: string
    Topic?: string
}

export type MainParametersPartial = Partial<LoggerMainParameters>

export type LoggerDataInner = LoggerBaseData & LoggerMainParameters

export type LoggerData = Omit<LoggerDataInner, 'ActionID'>

export type LoggerDataPartial = Partial<LoggerData>

export type LoggerLevelMap = Record<Level, Array<Level>>
