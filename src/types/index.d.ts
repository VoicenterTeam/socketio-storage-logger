export interface ConfigOptions {
    /**
     * This defines the initialized socket socket-io connection.
     */
    socket: any

    /**
     * This defines the socket connection url.
     */
    url: string

    /**
     * This defines initializing configuration options for socket-io connection.
     */
    socketOptions: object

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

export type ParseLogFunction = (level: string, logs: any[]) => string

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
     * This defines the namespace for the storage key.
     * This value should be unique across the projects.
     */
    namespace: string

    /**
     * This defines the interval for sending logs using sockets in milliseconds.
     */
    socketEmitInterval: number

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
