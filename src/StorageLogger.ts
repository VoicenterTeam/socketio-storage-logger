//import { io, Socket } from 'socket.io-client';
// @ts-ignore
//import io from "socket.io-client/dist/socket.io.js"
import io from "socket.io-client"

import CONFIG from './config/config'
import { isPromise } from "./helpers/isPromise"

import {StorageLoggerConfig} from "./interfaces/StorageLoggerConfig"

let globalConsole = console

const defaultConfig = {
    socketUrl: "http://127.0.0.1:3000/",
    connectOptions: {
        reconnection: true,
        reconnectionDelay: 5000,
        reconnectionAttempts: 10,
        perMessageDeflate: false,
        upgrade: false,
        transports: ['websocket'],
        debug: false
    },

}

export class StorageLogger {
    private _logToConsole: boolean;
    private _overloadGlobalConsole: boolean;
    public namespace: string;
    public socketEmitInterval: number;
    private _storageId: string;
    private _emitInProgress: boolean;
    private socket: any | undefined;
    private _interval: any;
    private _logIndex: number;
    private _getItem: (storage: string) => string | null;
    private _setItem: (storage: string, logs: string) => void;
    private _logMethod: (...params: any[]) => void;
    private _warnMethod: (...params: any[]) => void;
    private _errorMethod: (...params: any[]) => void;
    private _debugMethod: (...params: any[]) => void;

    /**
     * Initialize storage logger
     * @param config The configuration of the logger.
     */
    constructor(config: StorageLoggerConfig) {
        this.validateConfig(config)
        this._logToConsole = config.logToConsole ?? CONFIG.DEFAULT_LOG_TO_CONSOLE
        this._overloadGlobalConsole = config.overloadGlobalConsole ?? CONFIG.DEFAULT_OVERLOAD_CONSOLE
        this.namespace = config.namespace
        this.socketEmitInterval = config.socketEmitInterval || CONFIG.DEFAULT_SOCKET_EMIT_INTERVAL
        this._storageId = this.getStorageName(config.namespace)
        this._emitInProgress = false

        this._logIndex = 0

        this._getItem = config.getItem && typeof config.getItem === 'function' ? config.getItem : this._getItemDefault
        this._setItem = config.setItem && typeof config.setItem === 'function' ? config.setItem : this._setItemDefault

        this._logMethod = globalConsole.log;
        this._warnMethod = globalConsole.warn;
        this._errorMethod = globalConsole.error;
        this._debugMethod = globalConsole.debug;

        this._initStorage()
        this.initSocketConnection(config)

        if (this._overloadGlobalConsole) {
            this._overloadConsole()
        }
    }

    /**
     * Emits stored logs to the server and clears the log storage in case the emit operation was successful
     * @return {Promise<void>}
     */
    async emitLogs(): Promise<any> {
        if (this._emitInProgress) return
        try {
            const storedLogs = this._getItem(this._storageId)
            if (!storedLogs) return

            let keysToReset = []
            this._emitInProgress = true
            const parsedLogs = JSON.parse(storedLogs)
            let keys = Object.keys(parsedLogs)
            if (!keys.length) return
            if (!this.socket || !this.socket.connected) throw new Error("Socket is disconnected")

            for (const key of keys) {
                await this.socket.emit("Log", parsedLogs[key]); // logs only value
                keysToReset.push(key)
            }

            // During emitting sockets new logs could be added
            // To ensure that newly added logs which were added during socket emits will not be lost
            const logs = this._getItem(this._storageId)
            if (!logs) return
            const allLogs = JSON.parse(logs)
            keysToReset.forEach((key) => delete allLogs[key])

            // Update storage logs object after socket emits
            this._setItem(this._storageId, JSON.stringify(allLogs))
        } catch (err) {
            this._errorMethod(err)
        } finally {
            this._emitInProgress = false
        }
    }

    /**
     * Used to initialize new socket connection
     * @param socketUrl The url used for the socket connection.
     * @return void
     */
    initSocketConnection(config: StorageLoggerConfig): void {
        const connectUrl = config.socketUrl ? config.socketUrl : defaultConfig.socketUrl

        const connectOptions = {
            ...defaultConfig.connectOptions,
            ...config.connectOptions
        }

        this.socket = io(connectUrl, connectOptions);

        this._interval = setInterval(async () => {
            await this.emitLogs()
        }, this.socketEmitInterval)
    }

    /**
     * Used to interrupt socket connection
     * @return void
     */
    disconnectSocket(): void {
        if (!this.socket || !this._interval) return
        this.socket.disconnect()
        clearInterval(this._interval)
    }

    /**
     * Used to overload the global console object by logger methods.
     * @return void
     */
    _overloadConsole(): void {
        const self = this;
        globalConsole = Object.assign(globalConsole, {
            log: function () {
                // @ts-ignore
                self.log(...arguments)
            },
            warn: function () {
                // @ts-ignore
                self.warn(...arguments)
            },
            error: function () {
                // @ts-ignore
                self.error(...arguments)
            },
            debug: function () {
                // @ts-ignore
                self.debug(...arguments)
            }
        })
    }

    /**
     * Used to initialize the storage if it wasn't created before.
     * @return void
     */
    _initStorage(): void {
        const storedLogs = this._getItem(this._storageId)

        if (!storedLogs || typeof storedLogs !== "string") {
            this._setItem(this._storageId, JSON.stringify({}))
        }
    }

    /**
     * Reset log storage
     * @return void
     */
    resetStorage(): void {
        this._setItem(this._storageId, JSON.stringify({}))
    }

    /**
     * Validate logger configuration parameters
     * @param config The configuration of the logger.
     * @return void
     */
    validateConfig(config: StorageLoggerConfig): void {
        if (!config.namespace) {
            throw new Error("Config property \"namespace\" should be provided!")
        }

        if (config.getItem && typeof config.getItem === 'function') {
            const res = config.getItem('')
            if (isPromise(res)) throw new Error('getItem function should be synchronous!')
        }
        if (config.setItem && typeof config.setItem === 'function') {
            const res = config.setItem('', '')
            if (isPromise(res)) throw new Error('setItem function should be synchronous!')
        }
    }

    /**
     * Get storage name which is used to access the logs storage
     * @param namespace The unique namespace of the storage.
     * @param suffix The custom suffix for the storage name.
     * @return string
     */
    getStorageName(namespace: string, suffix: string = "_LOGGER_"): string {
        return namespace.toString().toUpperCase() + suffix + Date.now()
    }

    /**
     * Does common logic for logging data.
     * @param arguments The arguments of the log where the first argument contains the log level and other
     * arguments are logs to be stored
     * @return void
     */
    _processLog(...args: any[]): void {
        try {
            if (args.length < 2) return

            const level = args[0]
            const logs = args.slice(1)

            const storedLogs = this._getItem(this._storageId)
            if (!storedLogs) return

            const parsedLogs = JSON.parse(storedLogs)
            const key = this.formItemKey(level)

            const message = logs.join(' ')
            const time = new Date().toISOString()

            parsedLogs[key] = JSON.stringify({level, time, message})
            this._setItem(this._storageId, JSON.stringify(parsedLogs))
        } catch (e) {
            this._errorMethod(e)
        }
    }

    /**
     * Logs info data into the storage
     * @param arguments The arguments to be logged.
     * @return void
     */
    log(...args: any[]): void {
        this._processLog("INFO", ...args)
        if (this._logToConsole) {
            this._logMethod.apply(globalConsole, args)
        }
    }

    /**
     * Logs warn data into the storage
     * @param arguments The arguments to be logged.
     * @return void
     */
    warn(...args: any[]): void {
        this._processLog("WARN", ...args)
        if (this._logToConsole) {
            this._warnMethod.apply(globalConsole, args)
        }
    }

    /**
     * Logs error data into the storage
     * @param arguments The arguments to be logged.
     * @return void
     */
    error(...args: any[]): void {
        this._processLog("ERROR", ...args)
        if (this._logToConsole) {
            this._errorMethod.apply(globalConsole, args)
        }
    }

    /**
     * Logs debug data into the storage
     * @param arguments The arguments to be logged.
     * @return void
     */
    debug(...args: any[]): void {
        this._processLog("DEBUG", ...args)
        if (this._logToConsole) {
            this._debugMethod.apply(globalConsole, args)
        }
    }

    /**
     * The default method for getting logs from storage
     * @param storageId The identifier of storage where logs are stored.
     * @return string || null
     */
    _getItemDefault(storageId: string): string | null {
        return localStorage.getItem(storageId)
    }

    /**
     * The default method for setting logs into the storage
     * @param storageId The identifier of storage where to store the logs.
     * @param logs The logs to be stored.
     * @return void
     */
    _setItemDefault(storage: string, logs: string): void {
        try {
            localStorage.setItem(storage, logs);
        } catch (e) {
            this._errorMethod(e)
        }
    }

    /**
     * Used to form a key which will be used to store a log in the storage
     * @param level The log level. For example: Info, Warn, Error etc..
     * @return string
     */
    formItemKey(level: string): string {
        const date = new Date().toISOString()
        this._logIndex++
        return `${level}-${this.namespace}-${date}-${this._logIndex}`
    }
}