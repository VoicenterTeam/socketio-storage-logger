import { ConfigOptions } from "./types";
export declare class StorageLogger {
    private logToConsole;
    private overloadGlobalConsole;
    namespace: string;
    socketEmitInterval: number;
    private storageId;
    private emitInProgress;
    private queue;
    private processing;
    private interval;
    private logIndex;
    private socket;
    private getItem;
    private setItem;
    private parseLog;
    private _logMethod;
    private _warnMethod;
    private _errorMethod;
    private _debugMethod;
    /**
     * Initialize storage logger
     * @param config The configuration of the logger.
     */
    constructor(options: ConfigOptions);
    private setupStorageFunctions;
    private promisifyStorageFunction;
    /**
     * Used to initialize logger. Initializes storage, establishes socket connection and overloads console if needed
     * @param config The logger config.
     * @return void
     */
    private init;
    /**
     * Used to initialize new socket connection
     * @param socketUrl The url used for the socket connection.
     * @return void
     */
    private createConnection;
    /**
     * Emits stored logs to the server and clears the log storage in case the emit operation was successful
     * @return {Promise<void>}
     */
    private emitLogs;
    /**
     * Used to interrupt socket connection
     * @return void
     */
    disconnectSocket(): void;
    /**
     * Used to overload the global console object by logger methods.
     * @return void
     */
    private _overloadConsole;
    /**
     * Used to initialize the storage if it wasn't created before.
     * @return void
     */
    private initStorage;
    /**
     * Reset log storage
     * @return void
     */
    resetStorage(): Promise<void>;
    /**
     * Get storage name which is used to access the logs storage
     * @param suffix The custom suffix for the storage name.
     * @return string
     */
    getStorageName(suffix?: string): string;
    /**
     * Does common logic for logging data.
     * @param arguments The arguments of the log where the first argument contains the log level and other
     * arguments are logs to be stored
     * @return void
     */
    private processLog;
    private processQueue;
    /**
     * Logs info data into the storage
     * @param arguments The arguments to be logged.
     * @return void
     */
    log(...args: any[]): void;
    /**
     * Logs warn data into the storage
     * @param arguments The arguments to be logged.
     * @return void
     */
    warn(...args: any[]): void;
    /**
     * Logs error data into the storage
     * @param arguments The arguments to be logged.
     * @return void
     */
    error(...args: any[]): void;
    /**
     * Logs debug data into the storage
     * @param arguments The arguments to be logged.
     * @return void
     */
    debug(...args: any[]): void;
    /**
     * The default method for getting logs from storage
     * @param storageId The identifier of storage where logs are stored.
     * @return string || null
     */
    private defaultGetItemFunction;
    /**
     * The default method for setting logs into the storage
     * @param storageId The identifier of storage where to store the logs.
     * @param logs The logs to be stored.
     * @return void
     */
    private defaultSetItemFunction;
    /**
     * Used to form a key which will be used to store a log in the storage
     * @param level The log level. For example: Info, Warn, Error etc..
     * @return string
     */
    private formItemKey;
}
