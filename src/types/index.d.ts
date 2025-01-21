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

export type SyncGetItemFunction = (storage: string) => string | null
export type AsyncGetItemFunction = (storage: string) => Promise<string | null>

export type SyncSetItemFunction = (storage: string, logs: string) => void
export type AsyncSetItemFunction = (storage: string, logs: string) => Promise<void>

export type GetItemFunction = SyncGetItemFunction | AsyncGetItemFunction
export type SetItemFunction = SyncSetItemFunction | AsyncSetItemFunction

export type ParseLogFunction = (level: string, logs: unknown[]) => string

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
     * This defines the custom function for getting logs from storage is async
     */
    isGetItemAsync?: boolean

    /**
     * This defines the custom function for setting logs to storage is async
     */
    isSetItemAsync?: boolean

    /**
     * This defines the custom function for getting logs from storage.
     * It is useful if the custom storage is used for logs storage.
     * Function should be synchronous.
     */
    getItem?: GetItemFunction

    /**
     * This defines the custom function for setting logs to storage.
     * It is useful if the custom storage is used for logs storage.
     * Function should be synchronous.
     */
    setItem?: SetItemFunction

    /**
     * This defines the custom function for parsing logs.
     * Function should be synchronous.
     */
    parseLog?: ParseLogFunction
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
    Body?: string
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
