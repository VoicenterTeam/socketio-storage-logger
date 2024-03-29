import io from 'socket.io-client'
import { v4 as uuidv4 } from 'uuid'
import { isPromise } from './helpers/isPromise'
import { getLogData, removeLogsByKeys, parseLogDefault } from './helpers/helpers'
import { ConfigOptions, GetItemFunction, SetItemFunction, ParseLogFunction, ConsoleMethod } from "./types/index"
import { defaultConnectOptions, defaultLoggerOptions } from './enum'

type AnyFunction = (...args: any[]) => any

let globalConsole = console

interface ErrorMethod {
    (message?: any, ...optionalParams: any[]): void;
}

export default class StorageLogger {
    private logToConsole: boolean
    private overloadGlobalConsole: boolean
    public namespace: string
    public socketEmitInterval: number
    private storageId: string

    private emitInProgress: boolean
    private queue: Array<unknown>
    private processing: boolean
    private interval: any
    private logIndex: number

    private socket: any | undefined

    private getItem!: GetItemFunction
    private setItem!: SetItemFunction
    private parseLog!: ParseLogFunction

    private _logMethod!: ConsoleMethod
    private _warnMethod!: ConsoleMethod
    private _errorMethod!: ErrorMethod
    private _debugMethod!: ConsoleMethod

    /**
     * Initialize storage logger
     * @param config The configuration of the logger.
     */
    constructor(options: ConfigOptions) {
        const { loggerOptions } = options

        if (!loggerOptions.namespace) {
            throw new Error('Config property \'namespace\' should be provided!')
        }

        this.setupStorageFunctions(loggerOptions.getItem, loggerOptions.setItem, loggerOptions.parseLog)

        this.namespace = loggerOptions.namespace
        this.socketEmitInterval = loggerOptions.socketEmitInterval || defaultLoggerOptions.socketEmitInterval
        this.logToConsole =
            loggerOptions.logToConsole !== undefined ?
                loggerOptions.logToConsole :
                defaultLoggerOptions.logToConsole
        this.overloadGlobalConsole =
            loggerOptions.overloadGlobalConsole !== undefined ?
                loggerOptions.overloadGlobalConsole :
                defaultLoggerOptions.overloadGlobalConsole

        this.storageId = this.getStorageName()

        this.queue = []
        this.processing = false
        this.emitInProgress = false
        this.logIndex = 0

        this.init(options)
    }

    /**
     * Used to setup storage functions and logs parser function.
     * @param getItemFunction Function for getting item from storage.
     * @param setItemFunction Function for setting item to storage.
     * @param parseLogFunction Function for parsing logs.
     * @return void
     */
    private setupStorageFunctions (
        getItemFunction?: GetItemFunction,
        setItemFunction?: SetItemFunction,
        parseLogFunction?: ParseLogFunction
    ) {
        this.getItem =
            getItemFunction && typeof getItemFunction === 'function' ?
                this.promisifyStorageFunction(getItemFunction) :
                this.defaultGetItemFunction

        this.setItem =
            setItemFunction && typeof setItemFunction === 'function' ?
                this.promisifyStorageFunction(setItemFunction) :
                this.defaultSetItemFunction

        this.parseLog =
            parseLogFunction && typeof parseLogFunction === 'function' ?
                parseLogFunction :
                parseLogDefault
    }

    /**
     * Used to promisify storage function in case they are synchronous,
     * @param f The function to promisify.
     * @return f promisified function
     */
    private promisifyStorageFunction (f: AnyFunction): AnyFunction {
        const result = f('')
        const isSync = !isPromise(result)

        if (isSync) {
            return async (...args: any[]) => {
                return new Promise((resolve, reject) => {
                    try {
                        const data = f(...args)
                        resolve(data)
                    } catch (err) {
                        reject(err)
                    }
                })
            }
        }

        return f
    }

    /**
     * Used to initialize logger. Initializes storage, establishes socket connection and overloads console if needed
     * @param config The logger config.
     * @return void
     */
    private init(options: ConfigOptions) {
        const { socket, url, socketOptions = {} } = options

        this._logMethod = globalConsole.log.bind(globalConsole)//globalConsole.log
        this._warnMethod = globalConsole.warn.bind(globalConsole)//globalConsole.warn
        this._errorMethod = globalConsole.error.bind(globalConsole) as ErrorMethod/*(...args: any[]) => console.error(...args)*///(...args: any[]) => globalConsole.error(...args)//globalConsole.error
        this._debugMethod = globalConsole.debug.bind(globalConsole)//globalConsole.debug

        this.initStorage().then(() => {
            if (socket) {
                this.socket = socket
            } else if (url) {
                this.socket = this.createConnection(url, socketOptions)
            } else {
                throw new Error('Must provide either a \'socket\' or a \'url\' for socket connection')
            }

            this.interval = setInterval(async () => {
                await this.emitLogs()
            }, this.socketEmitInterval)

            if (this.overloadGlobalConsole) {
                this._overloadConsole()
            }
        })
    }

    /**
     * Used to initialize new socket connection
     * @param socketUrl The url used for the socket connection.
     * @return void
     */
    private createConnection(url: string, options: object = {}) {
        const connectOptions = {
            ...defaultConnectOptions,
            ...options
        }

        return io(url, connectOptions)
    }

    /**
     * Emits stored logs to the server and clears the log storage in case the emit operation was successful
     * @return {Promise<void>}
     */
    private async emitLogs(): Promise<any> {
        if (this.emitInProgress) return
        try {
            const storedLogs = await this.getItem(this.storageId)
            if (!storedLogs) return

            let keysToReset = []
            this.emitInProgress = true

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
            const logs = await this.getItem(this.storageId)
            if (!logs) return

            const logsToStore = removeLogsByKeys(logs, keysToReset)

            // Update storage logs object after socket emits
            await this.setItem(this.storageId, JSON.stringify(logsToStore))
        } catch (err) {
            this._errorMethod(err)
        } finally {
            this.emitInProgress = false
        }
    }

    /**
     * Used to interrupt socket connection
     * @return void
     */
    public disconnectSocket(): void {
        if (!this.socket || !this.interval) return
        this.socket.disconnect()
        clearInterval(this.interval)
    }

    /**
     * Used to overload the global console object by logger methods.
     * @return void
     */
    private _overloadConsole(): void {
        const self = this
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
    private async initStorage(): Promise<void> {
        const storedLogs = await this.getItem(this.storageId)

        if (!storedLogs || typeof storedLogs !== "string") {
            await this.setItem(this.storageId, JSON.stringify({}))
        }
    }

    /**
     * Reset log storage
     * @return void
     */
    public async resetStorage(): Promise<void> {
        await this.setItem(this.storageId, JSON.stringify({}))
    }

    /**
     * Get storage name which is used to access the logs storage
     * @param suffix The custom suffix for the storage name.
     * @return string
     */
    private getStorageName(): string {
        const randomId = uuidv4()
        return this.namespace.toString().toUpperCase() + randomId + Date.now()
    }

    /**
     * Does common logic for logging data.
     * @param arguments The arguments of the log where the first argument contains the log level and other
     * arguments are logs to be stored
     * @return void
     */
    private async processLog(...args: any[]): Promise<void> {
        try {
            if (args.length < 2) return

            const storedLogs = await this.getItem(this.storageId)
            if (!storedLogs) return

            const {level, logs} = getLogData(args)

            const parsedLogs = JSON.parse(storedLogs)
            const key = this.formItemKey(level)

            parsedLogs[key] = this.parseLog(level, logs)
            await this.setItem(this.storageId, JSON.stringify(parsedLogs))
        } catch (e) {
            this._errorMethod(e)
        }
    }

    /**
     * Used to process logs queue.
     * @return Promise<void>
     */
    private async processQueue() {
        // TODO update condition to return also when the logs are emitted to the sockets
        if (this.processing || this.queue.length === 0) {
            return // Exit if already processing or queue is empty
        }

        this.processing = true
        const data = this.queue.shift()

        await this.processLog(...data)
            .finally(() => {
                this.processing = false
                this.processQueue()
            })
    }

    /**
     * Logs info data into the storage
     * @param arguments The arguments to be logged.
     * @return void
     */
    public log(...args: any[]): void {
        const data = ['INFO', ...args]
        this.queue.push(data)
        if (this.logToConsole) {
            this._logMethod.apply(globalConsole, args)
        }
        this.processQueue()
    }

    /**
     * Logs warn data into the storage
     * @param arguments The arguments to be logged.
     * @return void
     */
    public warn(...args: any[]): void {
        const data = ['WARN', ...args]
        this.queue.push(data)
        if (this.logToConsole) {
            this._warnMethod.apply(globalConsole, args)
        }
        this.processQueue()
    }

    /**
     * Logs error data into the storage
     * @param arguments The arguments to be logged.
     * @return void
     */
    public error(...args: any[]): void {
        const data = ['ERROR', ...args]
        this.queue.push(data)
        if (this.logToConsole) {
            this._errorMethod.apply(globalConsole, args)
        }
        this.processQueue()
    }

    /**
     * Logs debug data into the storage
     * @param arguments The arguments to be logged.
     * @return void
     */
    public debug(...args: any[]): void {
        const data = ['DEBUG', ...args]
        this.queue.push(data)
        if (this.logToConsole) {
            this._debugMethod.apply(globalConsole, args)
        }
        this.processQueue()
    }

    /**
     * The default method for getting logs from storage
     * @param storageId The identifier of storage where logs are stored.
     * @return string || null
     */
    private async defaultGetItemFunction (storageId: string): Promise<string | null> {
        return localStorage.getItem(storageId)
    }

    /**
     * The default method for setting logs into the storage
     * @param storageId The identifier of storage where to store the logs.
     * @param logs The logs to be stored.
     * @return void
     */
    private async defaultSetItemFunction(storageId: string, logs: string): Promise<void> {
        try {
            localStorage.setItem(storageId, logs);
        } catch (e) {
            this._errorMethod(e)
        }
    }

    /**
     * Used to form a key which will be used to store a log in the storage
     * @param level The log level. For example: Info, Warn, Error etc..
     * @return string
     */
    private formItemKey(level: string): string {
        const date = new Date().toISOString()
        this.logIndex++
        return `${level}-${this.namespace}-${date}-${this.logIndex}`
    }
}
