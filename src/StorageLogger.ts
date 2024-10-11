import io, { Socket } from 'socket.io-client'
import { v4 as uuidv4 } from 'uuid'
import { promisify } from './helpers/helpers'
import { getLogData, removeLogsByKeys, parseLogDefault, parseLogObject, getOSString } from './helpers/helpers'
import {
    ConfigOptions,
    GetItemFunction,
    SetItemFunction,
    ParseLogFunction,
    ConsoleMethod,
    SyncGetItemFunction,
    LoggerDataInner,
    LoggerBaseData,
    LoggerDataPartial
} from './types'
import { ActionIDEnum, defaultConnectOptions, defaultLoggerOptions } from './enum'

let globalConsole = console

interface ErrorMethod<T> {
    (message?: T | unknown, ...optionalParams: T[] | unknown[]): void
}

export default class StorageLogger<DataType = unknown>{
    private readonly logToConsole: boolean
    private readonly overloadGlobalConsole: boolean
    public system: string
    public socketEmitInterval: number
    private readonly storageId: string

    private emitInProgress: boolean
    private queue: Array<Array<unknown>>
    private processing: boolean
    private storageInitialized: boolean
    private interval: ReturnType<typeof setInterval> | undefined
    private logIndex: number

    private socket: Socket | undefined

    private staticObject: LoggerDataPartial = {}
    private localObject: { [key: string]: DataType } = {}

    private readonly isGetItemAsync: boolean
    private readonly isSetItemAsync: boolean

    private getItem!: GetItemFunction
    private setItem!: SetItemFunction
    private parseLog!: ParseLogFunction

    private _logMethod!: ConsoleMethod<DataType>
    private _warnMethod!: ConsoleMethod<DataType>
    private _errorMethod!: ErrorMethod<DataType>
    private _debugMethod!: ConsoleMethod<DataType>

    /**
     * Initialize storage logger
     * @param options The configuration of the logger.
     */
    constructor (options: ConfigOptions) {
        const { loggerOptions } = options

        if (!loggerOptions.system) {
            throw new Error('Config property \'system\' should be provided!')
        }

        this.isGetItemAsync = loggerOptions.isGetItemAsync || false
        this.isSetItemAsync = loggerOptions.isSetItemAsync || false
        this.setupStorageFunctions(loggerOptions.getItem, loggerOptions.setItem, loggerOptions.parseLog)

        this.system = loggerOptions.system
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
        this.storageInitialized = false
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
            getItemFunction && typeof getItemFunction === 'function'
                ? this.isGetItemAsync ? getItemFunction : promisify(getItemFunction as SyncGetItemFunction)
                : this.defaultGetItemFunction

        this.setItem =
            setItemFunction && typeof setItemFunction === 'function'
                ? this.isSetItemAsync ? setItemFunction : promisify(setItemFunction)
                : this.defaultSetItemFunction

        this.parseLog =
            parseLogFunction && typeof parseLogFunction === 'function'
                ? parseLogFunction
                : parseLogDefault
    }

    /**
     * Used to initialize logger. Initializes storage, establishes socket connection and overloads console if needed
     * @param options The logger config.
     * @return void
     */
    private init (options: ConfigOptions) {
        const { socket, url, socketOptions = {} } = options

        this._logMethod = globalConsole.log.bind(globalConsole)//globalConsole.log
        this._warnMethod = globalConsole.warn.bind(globalConsole)//globalConsole.warn
        this._errorMethod = globalConsole.error.bind(globalConsole) as ErrorMethod<DataType>/*(...args: any[]) => console.error(...args)*///(...args: any[]) => globalConsole.error(...args)//globalConsole.error
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
     * @param url The url used for the socket connection.
     * @param options The options used for the socket connection.
     * @return void
     */
    private createConnection (url: string, options: object = {}) {
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
    private async emitLogs (): Promise<void> {
        if (this.emitInProgress) return
        try {
            const storedLogs = await this.getItem(this.storageId)
            const storageLogs = JSON.parse(storedLogs || '{}')

            const parsedLogs = {
                ...this.localObject,
                ...storageLogs
            }

            if (!Object.keys(parsedLogs).length) return

            const keysToReset = []
            this.emitInProgress = true

            const keys = Object.keys(parsedLogs)
            if (!keys.length) return
            if (!this.socket || !this.socket.connected) throw new Error('Socket is disconnected')

            for (const key of keys) {
                const parsedObject = parseLogObject(parsedLogs[key])

                const logData: LoggerDataInner = {
                    ...this.staticObject,
                    ...parsedObject,
                }
                const sendingLog = this.populateSendingLog(logData)
                await this.socket.emit("Log", JSON.stringify(sendingLog)) // logs only value
                keysToReset.push(key)
            }

            // During emitting sockets new logs could be added
            // To ensure that newly added logs which were added during socket emits will not be lost
            const logs = await this.getItem(this.storageId)

            if (!logs) return

            const logsToStore = removeLogsByKeys(logs, keysToReset)
            this.localObject = {}

            // Update storage logs object after socket emits
            await this.setItem(this.storageId, JSON.stringify(logsToStore))
        } catch (err) {
            this._errorMethod(err)
        } finally {
            this.emitInProgress = false
        }
    }

    /**
     * Used to set additional properties for every sending log
     * @return LoggerDataInner
     */
    private populateSendingLog (data: LoggerDataInner) {
        const sendingData: LoggerDataInner = {
            ...data
        }
        const actionName = sendingData.ActionName
        if (actionName) {
            sendingData.ActionID = ActionIDEnum[actionName]
        }

        return sendingData
    }

     /**
     * Used to set a static object which will be send in every message
     * @return void
     */
    public setupStaticFields(data: LoggerDataPartial) {
        this.staticObject = { ...data }
    }

    /**
     * Used to populate sending message object with static client parameters
     * @return object
     */
    private populateMetaData(): LoggerBaseData {
        const DateTime = new Date()
        let UserAgent
        if (typeof window !== 'undefined' && typeof window.document !== 'undefined') {
            UserAgent = window?.navigator.userAgent
        } else if (typeof self !== 'undefined' && self.navigator) {
            UserAgent = self.navigator.userAgent
        }
        let OSVersion
        if (UserAgent) {
            OSVersion = getOSString(UserAgent)
        }
        return {
            System: this.system,
            DateTime,
            UserAgent,
            OSVersion
        }
    }

    /**
     * Used to stop logger and interrupt socket connection
     * @return void
     */
    public async stop () {
        if (!this.socket || !this.socket.connected) {
            return
        }

        clearInterval(this.interval)
        await this.emitLogs()

        this.socket.disconnect()
    }

    /**
     * Used to start logger and reconnect socket connection
     * @return void
     */
    public async start () {
        if (this.socket && this.socket.connected) {
            return
        }

        this.socket.connect();

        this.interval = setInterval(async () => {
            await this.emitLogs()
        }, this.socketEmitInterval)
    }

    /**
     * Used to overload the global console object by logger methods.
     * @return void
     */
    private _overloadConsole (): void {
        globalConsole = Object.assign(
            globalConsole,
            {
                log: (arg: DataType) => {
                    this.log(arg)
                },
                warn: (arg: DataType) => {
                    this.warn(arg)
                },
                error: (arg: DataType) => {
                    this.error(arg)
                },
                debug: (arg: DataType) => {
                    this.debug(arg)
                }
            }
        )
    }

    /**
     * Used to initialize the storage if it wasn't created before.
     * @return void
     */
    private async initStorage (): Promise<void> {
        const storedLogs = await this.getItem(this.storageId)

        if (!storedLogs || typeof storedLogs !== 'string') {
            await this.setItem(this.storageId, JSON.stringify({}))
            this.storageInitialized = true
        }
    }

    /**
     * Reset log storage
     * @return void
     */
    public async resetStorage (): Promise<void> {
        await this.setItem(this.storageId, JSON.stringify({}))
    }

    /**
     * Get storage name which is used to access the logs storage
     * @return string
     */
    private getStorageName (): string {
        const randomId = uuidv4()
        return this.system.toString().toUpperCase() + randomId + Date.now()
    }

    /**
     * Does common logic for logging data.
     * @param args The arguments of the log where the first argument contains the log level and other
     * arguments are logs to be stored
     * @return void
     */
    private async processLog (...args: [string, DataType]): Promise<void> {
        try {
            if (args.length < 2) return

            const level = args[0]
            const log = args[1]
            //const { level, logs } = getLogData(args)
            const key = this.formItemKey(level)

            if (!this.storageInitialized) {
                this.localObject = {
                    ...this.localObject,
                    [key]: log
                }

                return
            }

            const storedLogs = await this.getItem(this.storageId)
            if (!storedLogs) return

            const parsedLogs = JSON.parse(storedLogs)

            parsedLogs[key] = JSON.stringify(log) //this.parseLog(level, logs)
            await this.setItem(this.storageId, JSON.stringify(parsedLogs))
        } catch (e) {
            this._errorMethod(e)
        }
    }

    /**
     * Used to process logs queue.
     * @return Promise<void>
     */
    private async processQueue () {
        // TODO update condition to return also when the logs are emitted to the sockets
        if (this.processing || this.queue.length === 0) {
            return // Exit if already processing or queue is empty
        }

        const data = this.queue.shift()

        if (!data) {
            return // Exit if queue is empty
        }

        this.processing = true

        await this.processLog(...data)
            .finally(() => {
                this.processing = false
                this.processQueue()
            })
    }

    /**
     * Logs info data into the storage
     * @param args The arguments to be logged.
     * @return void
     */
    public log (logData: DataType): void {
        const additionalData: LoggerBaseData = this.populateMetaData()
        const log: DataType = {
            ...additionalData,
            ...logData
        }
        const data = [ 'INFO', log ]
        this.queue.push(data)
        if (this.logToConsole) {
            this._logMethod.apply(globalConsole, [ log ])
        }
        this.processQueue()
    }

    /**
     * Logs warn data into the storage
     * @param args The arguments to be logged.
     * @return void
     */
    public warn (logData: DataType): void {
        const data = [ 'WARN', logData ]
        this.queue.push(data)

        if (this.logToConsole) {
            this._warnMethod.apply(globalConsole, [ logData ])
        }

        this.processQueue()
    }

    /**
     * Logs error data into the storage
     * @param args The arguments to be logged.
     * @return void
     */
    public error (logData: DataType): void {
        const data = [ 'ERROR', logData ]
        this.queue.push(data)

        if (this.logToConsole) {
            this._errorMethod.apply(globalConsole, [ logData ])
        }

        this.processQueue()
    }

    /**
     * Logs debug data into the storage
     * @param args The arguments to be logged.
     * @return void
     */
    public debug (logData: DataType): void {
        const data = [ 'DEBUG', logData ]
        this.queue.push(data)

        if (this.logToConsole) {
            this._debugMethod.apply(globalConsole, [ logData ])
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
    private async defaultSetItemFunction (storageId: string, logs: string): Promise<void> {
        try {
            localStorage.setItem(storageId, logs)
        } catch (e) {
            this._errorMethod(e)
        }
    }

    /**
     * Used to form a key which will be used to store a log in the storage
     * @param level The log level. For example: Info, Warn, Error etc..
     * @return string
     */
    private formItemKey (level: string): string {
        const date = new Date().toISOString()

        this.logIndex++

        return `${level}-${this.system}-${date}-${this.logIndex}`
    }
}
