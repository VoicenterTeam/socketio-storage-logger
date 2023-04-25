import { AsyncStorageLoggerConfig } from "./interfaces/AsyncStorageLoggerConfig";
export declare class AsyncStorageLogger {
    private _logToConsole;
    private _overloadGlobalConsole;
    namespace: string;
    socketEmitInterval: number;
    private _storageId;
    private _emitInProgress;
    private socket;
    private _interval;
    private _logIndex;
    private _getItem;
    private _setItem;
    private _parseLog;
    private _logMethod;
    private _warnMethod;
    private _errorMethod;
    private _debugMethod;
    /**
     * Initialize storage logger
     * @param config The configuration of the logger.
     */
    constructor(config: AsyncStorageLoggerConfig);
    /**
     * Used to initialize logger. Initializes storage, establishes socket connection and overloads console if needed
     * @param config The logger config.
     * @return void
     */
    initLogger(config: AsyncStorageLoggerConfig): void;
    /**
     * Emits stored logs to the server and clears the log storage in case the emit operation was successful
     * @return {Promise<void>}
     */
    emitLogs(): Promise<any>;
    /**
     * Used to initialize new socket connection
     * @param socketUrl The url used for the socket connection.
     * @return void
     */
    initSocketConnection(socketConnection: any): void;
    /**
     * Used to interrupt socket connection
     * @return void
     */
    disconnectSocket(): void;
    /**
     * Used to overload the global console object by logger methods.
     * @return void
     */
    _overloadConsole(): void;
    /**
     * Used to initialize the storage if it wasn't created before.
     * @return void
     */
    _initStorage(): Promise<void>;
    /**
     * Reset log storage
     * @return void
     */
    resetStorage(): Promise<void>;
    /**
     * Validate logger configuration parameters
     * @param config The configuration of the logger.
     * @return void
     */
    validateConfig(config: AsyncStorageLoggerConfig): void;
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
    _processLog(...args: any[]): Promise<void>;
    /**
     * Logs info data into the storage
     * @param arguments The arguments to be logged.
     * @return void
     */
    log(...args: any[]): Promise<void>;
    /**
     * Logs warn data into the storage
     * @param arguments The arguments to be logged.
     * @return void
     */
    warn(...args: any[]): Promise<void>;
    /**
     * Logs error data into the storage
     * @param arguments The arguments to be logged.
     * @return void
     */
    error(...args: any[]): Promise<void>;
    /**
     * Logs debug data into the storage
     * @param arguments The arguments to be logged.
     * @return void
     */
    debug(...args: any[]): Promise<void>;
    /**
     * The default method for getting logs from storage
     * @param storageId The identifier of storage where logs are stored.
     * @return string || null
     */
    _getItemDefault(storageId: string): Promise<string | null>;
    /**
     * The default method for setting logs into the storage
     * @param storageId The identifier of storage where to store the logs.
     * @param logs The logs to be stored.
     * @return void
     */
    _setItemDefault(storageId: string, logs: string): Promise<void>;
    /**
     * Used to form a key which will be used to store a log in the storage
     * @param level The log level. For example: Info, Warn, Error etc..
     * @return string
     */
    formItemKey(level: string): string;
}
