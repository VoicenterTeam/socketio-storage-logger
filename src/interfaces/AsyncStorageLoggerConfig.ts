export interface AsyncStorageLoggerConfig {
    /**
     * This defines if logger should contain default behavior like logging data to console.
     */
    logToConsole: boolean;

    /**
     * This defines if the global console object should be overloaded with logger functionality.
     */
    overloadGlobalConsole: boolean;

    /**
     * This defines the namespace for the storage key.
     * This value should be unique across the projects.
     */
    namespace: string;

    /**
     * This defines the initialized socket socket-io connection.
     */
    socketConnection: any;

    /**
     * This defines the interval for sending logs using sockets in milliseconds.
     */
    socketEmitInterval: number;

    /**
     * This defines the custom function for getting logs from storage.
     * It is useful if the custom storage is used for logs storage.
     * Function should be synchronous.
     */
    getItem: (storage: string) => Promise<string | null>;

    /**
     * This defines the custom function for setting logs to storage.
     * It is useful if the custom storage is used for logs storage.
     * Function should be synchronous.
     */
    setItem: (storage: string, logs: string) => Promise<void>;
}