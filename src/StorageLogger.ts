// @ts-expect-error The version of socket io used has no types yet
import io, { Socket, SocketOptions } from 'socket.io-client'
import { v4 as uuidv4 } from 'uuid'
import { promisify } from './helpers/helpers'
import { removeLogsByKeys, parseLogDefault, parseLogObject, getOSString } from './helpers/helpers'
import {
    ConfigOptions,
    GetItemFunction,
    SetItemFunction,
    ParseLogFunction,
    ConsoleMethod,
    SyncGetItemFunction,
    LoggerDataInner,
    LoggerBaseData,
    LoggerDataPartial,
    Level,
    LoggerLevelMap
} from './types'
import { ActionIDEnum, defaultConnectOptions, defaultLoggerOptions, LevelEnum } from './enum'

let globalConsole = console

interface ErrorMethod<T> {
    (message?: T | unknown, ...optionalParams: T[] | unknown[]): void
}

export default class StorageLogger<DataType = unknown> {
    private readonly logToConsole: boolean
    private readonly overloadGlobalConsole: boolean
    public system: string
    public socketEmitInterval: number
    private readonly storageId: string
    private loggerLevel: Level = LevelEnum.DEBUG
    private isActive = false
    private readonly loggerLevelMap: LoggerLevelMap = {
        [LevelEnum.DEBUG]: [
            LevelEnum.DEBUG,
            LevelEnum.INFO,
            LevelEnum.WARNING,
            LevelEnum.ERROR
        ],
        [LevelEnum.INFO]: [
            LevelEnum.INFO,
            LevelEnum.WARNING,
            LevelEnum.ERROR
        ],
        [LevelEnum.WARNING]: [
            LevelEnum.WARNING,
            LevelEnum.ERROR
        ],
        [LevelEnum.ERROR]: [
            LevelEnum.ERROR
        ]
    }

    private emitInProgress: boolean
    private queue: Array<Array<unknown>>
    private processing: boolean
    private storageInitialized: boolean
    private interval: ReturnType<typeof setInterval> | undefined
    private logIndex: number

    private socket: Socket | undefined
    private requestUrl: string | undefined

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

    // Debug-related properties
    private loggerDebugEnabled: boolean = false
    private debugPrefix: string = '[StorageLogger-Debug]'

    /**
     * Initialize storage logger
     * @param options The configuration of the logger.
     */
    constructor (options: ConfigOptions) {
        const { loggerOptions } = options

        if (loggerOptions.debugPrefix) {
            this.debugPrefix = `${this.debugPrefix}_[${loggerOptions.debugPrefix}]`
        }

        this.internalDebugLog('Constructor called with options:', loggerOptions)

        if (!loggerOptions.system) {
            throw new Error('Config property \'system\' should be provided!')
        }

        this.isGetItemAsync = loggerOptions.isGetItemAsync || false
        this.isSetItemAsync = loggerOptions.isSetItemAsync || false
        this.setupStorageFunctions(loggerOptions.getItem, loggerOptions.setItem, loggerOptions.parseLog)

        this.system = loggerOptions.system

        if (loggerOptions.loggerLevel) {
            if (loggerOptions.loggerLevel) {
                if (this.isLogLevel(loggerOptions.loggerLevel)) {
                    this.loggerLevel = loggerOptions.loggerLevel
                    this.internalDebugLog('Logger level set to:', this.loggerLevel)
                } else {
                    console.error(`The "${loggerOptions.loggerLevel}" is not supported log level. The supported levels are: ${Object.keys(this.loggerLevel).join(', ')}`)
                }
            }
        }

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
        this.internalDebugLog('Storage ID generated:', this.storageId)

        this.queue = []
        this.processing = false
        this.storageInitialized = false
        this.emitInProgress = false
        this.logIndex = 0
        this.staticObject = loggerOptions.staticObject ?? {}
        this.internalDebugLog('Static object initialized:', this.staticObject)

        this.init(options)
    }

    /**
     * Enable or disable internal debug logging
     * @param enabled Boolean indicating whether debug logging should be enabled
     */
    public toggleDebugLogging (enabled: boolean): void {
        this.loggerDebugEnabled = enabled
        this.internalDebugLog(`Debug logging ${enabled ? 'enabled' : 'disabled'}`)
    }

    /**
     * Check if debug logging is enabled
     * @returns Boolean indicating whether debug logging is enabled
     */
    public isDebugLoggingEnabled (): boolean {
        return this.loggerDebugEnabled
    }

    /**
     * Internal method for debug logging
     * @param message The message to log
     * @param data Optional data to log
     */
    private internalDebugLog (message: string, ...data: unknown[]): void {
        if (!this.loggerDebugEnabled) return

        const timestamp = new Date().toISOString()
        if (data.length) {
            console.log(`${this.debugPrefix} [${timestamp}] ${message}`, ...data)
        } else {
            console.log(`${this.debugPrefix} [${timestamp}] ${message}`)
        }
    }

    get currentLoggerLevelLogLevels () {
        return this.loggerLevelMap[this.loggerLevel]
    }

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
    public changeLogLevel (level: Level) {
        this.internalDebugLog(`Attempting to change log level from ${this.loggerLevel} to ${level}`)

        if (this.isLogLevel(level)) {
            this.loggerLevel = level
            this.internalDebugLog(`Log level changed to ${level}`)
        } else {
            console.error(`The "${level}" is not supported log level. The supported levels are: ${Object.keys(this.loggerLevel).join(', ')}`)
            this.internalDebugLog(`Failed to change log level, invalid level: ${level}`)
        }
    }

    private isLogLevel (level: string): level is Level {
        const result = level in this.loggerLevelMap
        this.internalDebugLog(`Checking if ${level} is a valid log level: ${result}`)
        return result
    }

    public isLogLevelAllowed (level: Level) {
        const result = this.currentLoggerLevelLogLevels.includes(level)
        this.internalDebugLog(`Checking if log level ${level} is allowed under current setting ${this.loggerLevel}: ${result}`)
        return result
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
        this.internalDebugLog('Setting up storage functions')

        this.getItem =
            getItemFunction && typeof getItemFunction === 'function'
                ? this.isGetItemAsync ? getItemFunction : promisify(getItemFunction as SyncGetItemFunction)
                : this.defaultGetItemFunction
        this.internalDebugLog('Get item function setup complete, using custom function:', !!getItemFunction)

        this.setItem =
            setItemFunction && typeof setItemFunction === 'function'
                ? this.isSetItemAsync ? setItemFunction : promisify(setItemFunction)
                : this.defaultSetItemFunction
        this.internalDebugLog('Set item function setup complete, using custom function:', !!setItemFunction)

        this.parseLog =
            parseLogFunction && typeof parseLogFunction === 'function'
                ? parseLogFunction
                : parseLogDefault
        this.internalDebugLog('Parse log function setup complete, using custom function:', !!parseLogFunction)
    }

    /**
     * Used to send http log request.
     * @param logs logs array which is sent in request body.
     * @return {Promise<Response>}
     */
    private sendHttpRequest (logs: Array<LoggerDataInner>): Promise<Response> {
        this.internalDebugLog('Sending HTTP request with logs', logs)

        if (!this.requestUrl) {
            const error = new Error('requestUrl is not provided')
            this.internalDebugLog('HTTP request failed:', error.message)
            throw error
        }

        const body = {
            Data: logs
        }

        this.internalDebugLog(`Sending HTTP request to ${this.requestUrl}`, body)
        return fetch(this.requestUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        }).then(response => {
            this.internalDebugLog('HTTP request completed with status:', response.status)
            return response
        }).catch(error => {
            this.internalDebugLog('HTTP request failed:', error)
            throw error
        })
    }

    /**
     * Used to initialize logger. Initializes storage, establishes socket connection and overloads console if needed
     * @param options The logger config.
     * @return void
     */
    private init (options: ConfigOptions) {
        this.internalDebugLog('Initializing logger with options:', options)
        const { socket, url, requestUrl, socketOptions = {} } = options

        this._logMethod = globalConsole.log.bind(globalConsole)
        this._warnMethod = globalConsole.warn.bind(globalConsole)
        this._errorMethod = globalConsole.error.bind(globalConsole) as ErrorMethod<DataType>
        this._debugMethod = globalConsole.debug.bind(globalConsole)
        this.internalDebugLog('Console methods bound')

        this.initStorage().then(() => {
            this.internalDebugLog('Storage initialized')
            if (socket) {
                this.internalDebugLog('Using provided socket')
                this.socket = socket
            } else if (url) {
                this.internalDebugLog(`Creating socket connection to ${url}`)
                this.socket = this.createConnection(url, socketOptions)
            } else if (requestUrl) {
                this.internalDebugLog(`Using HTTP request URL: ${requestUrl}`)
                this.requestUrl = requestUrl
            } else {
                const error = new Error('Must provide either a \'socket\', \'requestUrl\' or a \'url\' for logger requests')
                this.internalDebugLog('Initialization failed:', error.message)
                throw error
            }

            this.internalDebugLog(`Setting up emit interval: ${this.socketEmitInterval}ms`)
            this.interval = setInterval(async () => {
                this.internalDebugLog('Emit interval triggered')
                await this.emitLogs()
            }, this.socketEmitInterval)

            if (this.overloadGlobalConsole) {
                this.internalDebugLog('Overloading global console')
                this._overloadConsole()
            }

            this.internalDebugLog('Logger initialization complete')

            this.isActive = true
        }).catch(error => {
            this.internalDebugLog('Logger initialization failed:', error)
        })
    }

    /**
     * Used to initialize new socket connection
     * @param url The url used for the socket connection.
     * @param options The options used for the socket connection.
     * @return void
     */
    private createConnection (url: string, options?: SocketOptions) {
        this.internalDebugLog(`Creating socket connection to ${url}`)

        let connectOptions = {
            ...defaultConnectOptions,
        }

        if (options) {
            connectOptions = {
                ...connectOptions,
                ...options
            }
            this.internalDebugLog('Using custom socket options:', options)
        }

        const socket = io(url, connectOptions)

        // Add event listeners for debugging
        if (this.loggerDebugEnabled) {
            socket.on('connect', () => {
                this.internalDebugLog('Socket connected')
            })

            socket.on('disconnect', (reason: unknown) => {
                this.internalDebugLog('Socket disconnected, reason:', reason)
            })

            socket.on('connect_error', (error: unknown) => {
                this.internalDebugLog('Socket connection error:', error)
            })

            socket.on('reconnect', (attemptNumber: number) => {
                this.internalDebugLog('Socket reconnected after attempts:', attemptNumber)
            })
        }

        return socket
    }

    /**
     * Emits stored logs to the server and clears the log storage in case the emit operation was successful
     * @return {Promise<void>}
     */
    public async emitLogs (): Promise<void> {
        this.internalDebugLog('Attempting to emit logs')

        if (this.emitInProgress) {
            this.internalDebugLog('Emit already in progress, skipping')
            return
        }

        try {
            this.internalDebugLog('Retrieving logs from storage')
            const storedLogs = await this.getItem(this.storageId)
            this.internalDebugLog('Storage data retrieved:', storedLogs)

            const storageLogs = JSON.parse(storedLogs || '{}')
            this.internalDebugLog('Parsed storage logs:', storageLogs)

            const parsedLogs = {
                ...this.localObject,
                ...storageLogs
            }
            this.internalDebugLog('Combined logs:', parsedLogs)

            if (!Object.keys(parsedLogs).length) {
                this.internalDebugLog('No logs to emit, skipping')
                return
            }

            const keysToReset = []
            this.emitInProgress = true
            this.internalDebugLog('Emit in progress flag set')

            const keys = Object.keys(parsedLogs)
            if (!keys.length) {
                this.internalDebugLog('No log keys found, skipping')
                return
            }

            if ((!this.socket || !this.socket.connected) && !this.requestUrl) {
                const error = new Error('Log request can\'t be sent. Socket is disconnected or requestUrl is not provided')
                this.internalDebugLog('Emit failed:', error.message)

                return
            }

            const httpRequestLogs: Array<LoggerDataInner> = []
            this.internalDebugLog(`Processing ${keys.length} log entries`)

            for (const key of keys) {
                this.internalDebugLog(`Processing log entry with key: ${key}`)
                const parsedObject = parseLogObject(parsedLogs[key])
                this.internalDebugLog('Parsed log object:', parsedObject)

                const logData: LoggerDataInner = {
                    ...this.staticObject,
                    ...parsedObject,
                }
                this.internalDebugLog('Combined log data with static fields:', logData)

                const sendingLog = this.populateSendingLog(logData)
                this.internalDebugLog('Prepared log for sending:', sendingLog)

                if (sendingLog.Body && typeof sendingLog.Body === 'string') {
                    sendingLog.Body = JSON.parse(sendingLog.Body)
                    this.internalDebugLog('Parsed string body to object')
                }

                if (this.socket) {
                    this.internalDebugLog('Emitting log via socket')
                    this.socket.emit('Log', sendingLog)
                } else if (this.requestUrl) {
                    this.internalDebugLog('Adding log to HTTP request batch')
                    httpRequestLogs.push(sendingLog)
                }

                keysToReset.push(key)
            }

            if (httpRequestLogs.length) {
                this.internalDebugLog(`Sending ${httpRequestLogs.length} logs via HTTP request`)
                await this.sendHttpRequest(httpRequestLogs)
                this.internalDebugLog('HTTP request completed')
            }

            // During emitting sockets new logs could be added
            // To ensure that newly added logs which were added during socket emits will not be lost
            this.internalDebugLog('Re-retrieving logs to capture any added during emit')
            const logs = await this.getItem(this.storageId)

            if (!logs) {
                this.internalDebugLog('No logs found after emit, skipping cleanup')
                return
            }

            this.internalDebugLog(`Removing ${keysToReset.length} processed logs from storage`)
            const logsToStore = removeLogsByKeys(logs, keysToReset)
            this.internalDebugLog('Remaining logs after cleanup:', logsToStore)

            this.localObject = {}
            this.internalDebugLog('Cleared local object cache')

            // Update storage logs object after socket emits
            this.internalDebugLog('Updating storage with remaining logs')
            await this.setItem(this.storageId, JSON.stringify(logsToStore))
            this.internalDebugLog('Storage updated successfully')
        } catch (err) {
            this.internalDebugLog('Error during emit:', err)
            this._errorMethod(err)
        } finally {
            this.emitInProgress = false
            this.internalDebugLog('Emit in progress flag cleared')
        }
    }

    /**
     * Used to set additional properties for every sending log
     * @return LoggerDataInner
     */
    private populateSendingLog (data: LoggerDataInner) {
        this.internalDebugLog('Populating sending log with additional properties', data)

        const sendingData: LoggerDataInner = {
            ...data
        }
        const actionName = sendingData.ActionName

        if (actionName) {
            sendingData.ActionID = ActionIDEnum[actionName]
            this.internalDebugLog(`Set ActionID from ActionName ${actionName}:`, sendingData.ActionID)
        }

        return sendingData
    }

    /**
     * Used to set a static object which will be send in every message
     * @return void
     */
    public setupStaticFields (data: LoggerDataPartial) {
        this.internalDebugLog('Setting up static fields:', data)
        this.staticObject = { ...data }
    }

    /**
     * Used to update a static object which will be send in every message
     * @return void
     */
    public updateStaticFields (data: LoggerDataPartial) {
        this.internalDebugLog('Updating static fields with:', data)
        this.staticObject = {
            ...this.staticObject,
            ...data
        }
        this.internalDebugLog('Static fields after update:', this.staticObject)
    }

    /**
     * Used to populate sending message object with static client parameters
     * @return object
     */
    private populateMetaData (): LoggerBaseData {
        this.internalDebugLog('Populating metadata')
        const DateTime = new Date()
        this.internalDebugLog('Current DateTime:', DateTime)

        let UserAgent

        if (typeof window !== 'undefined' && typeof window.document !== 'undefined') {
            UserAgent = window?.navigator.userAgent
            this.internalDebugLog('UserAgent from window:', UserAgent)
        } else if (typeof self !== 'undefined' && self.navigator) {
            UserAgent = self.navigator.userAgent
            this.internalDebugLog('UserAgent from self:', UserAgent)
        }

        let OSVersion

        if (UserAgent) {
            OSVersion = getOSString(UserAgent)
            this.internalDebugLog('Detected OS version:', OSVersion)
        }

        const metadata = {
            System: this.system,
            DateTime,
            UserAgent,
            OSVersion
        }

        this.internalDebugLog('Complete metadata:', metadata)
        return metadata
    }

    /**
     * Used to stop logger and interrupt socket connection
     * @return void
     */
    public async stop () {
        this.internalDebugLog('[STORAGE_LOGGER_STOP] Stopping logger')

        if (!this.isActive) {
            this.internalDebugLog('[STORAGE_LOGGER_STOP] Logger already stooped, skipping stop.')
            return
        }

        this.internalDebugLog('[STORAGE_LOGGER_STOP] Clearing emit interval')
        clearInterval(this.interval)

        this.internalDebugLog('[STORAGE_LOGGER_STOP] Performing final emit before stopping')
        await this.emitLogs()

        this.internalDebugLog('[STORAGE_LOGGER_STOP] Disconnecting socket')
        if (!this.socket || !this.socket.connected) {
            this.internalDebugLog('[STORAGE_LOGGER_STOP] Socket not connected, skipping disconnect')
        } else {
            this.socket.disconnect()
            this.internalDebugLog('[STORAGE_LOGGER_STOP] Disconnected socket')
        }

        this.internalDebugLog('[STORAGE_LOGGER_STOP] Logger stopped')

        this.isActive = false
    }

    /**
     * Used to start logger and reconnect socket connection
     * @return void
     */
    public async start () {
        this.internalDebugLog('[STORAGE_LOGGER_START] Starting logger')

        if (this.isActive) {
            this.internalDebugLog('[STORAGE_LOGGER_START] Logger already started, skipping start.')
            return
        }

        this.internalDebugLog('[STORAGE_LOGGER_START] Connecting socket')

        if (this.socket) {
            if (this.socket.connected) {
                this.internalDebugLog('[STORAGE_LOGGER_START] Socket already connected, skipping socket reconnection')
            } else {
                this.internalDebugLog('[STORAGE_LOGGER_START] Socket reconnection initiated')
                this.socket.connect()
            }
        }

        this.internalDebugLog(`[STORAGE_LOGGER_START] Setting up emit interval: ${this.socketEmitInterval}ms`)

        this.interval = setInterval(async () => {
            this.internalDebugLog('[STORAGE_LOGGER_START] Emit interval triggered')
            await this.emitLogs()
        }, this.socketEmitInterval)

        this.internalDebugLog('[STORAGE_LOGGER_START] Logger started')

        this.isActive = true
    }

    /**
     * Used to overload the global console object by logger methods.
     * @return void
     */
    private _overloadConsole (): void {
        this.internalDebugLog('Overloading global console methods')

        globalConsole = Object.assign(
            globalConsole,
            {
                log: (arg: DataType) => {
                    this.internalDebugLog('Intercepted console.log call')
                    this.log(arg)
                },
                warn: (arg: DataType) => {
                    this.internalDebugLog('Intercepted console.warn call')
                    this.warn(arg)
                },
                error: (arg: DataType) => {
                    this.internalDebugLog('Intercepted console.error call')
                    this.error(arg)
                },
                debug: (arg: DataType) => {
                    this.internalDebugLog('Intercepted console.debug call')
                    this.debug(arg)
                }
            }
        )
        this.internalDebugLog('Console methods overloaded')
    }

    /**
     * Used to initialize the storage if it wasn't created before.
     * @return void
     */
    private async initStorage (): Promise<void> {
        this.internalDebugLog('Initializing storage')

        const storedLogs = await this.getItem(this.storageId)
        this.internalDebugLog('Checking existing logs in storage:', storedLogs)

        if (!storedLogs || typeof storedLogs !== 'string') {
            this.internalDebugLog('No valid logs found, initializing empty storage')
            await this.setItem(this.storageId, JSON.stringify({}))
            this.storageInitialized = true
            this.internalDebugLog('Storage initialized with empty object')
        } else {
            this.storageInitialized = true
            this.internalDebugLog('Storage already contains logs, skipping initialization')
        }
    }

    /**
     * Reset log storage
     * @return void
     */
    public async resetStorage (): Promise<void> {
        this.internalDebugLog('Resetting storage')
        await this.setItem(this.storageId, JSON.stringify({}))
        this.internalDebugLog('Storage reset complete')
    }

    /**
     * Get storage name which is used to access the logs storage
     * @return string
     */
    private getStorageName (): string {
        const randomId = uuidv4()
        const storageName = this.system.toString().toUpperCase() + randomId + Date.now()
        this.internalDebugLog('Generated storage name:', storageName)
        return storageName
    }

    /**
     * Does common logic for logging data.
     * @param args The arguments of the log where the first argument contains the log level and other
     * arguments are logs to be stored
     * @return void
     */
    private async processLog (...args: [string, DataType]): Promise<void> {
        this.internalDebugLog('Processing log:', args)

        try {
            if (args.length < 2) {
                this.internalDebugLog('Insufficient arguments for processing log, skipping')
                return
            }

            const level = args[0]
            const log = args[1]
            this.internalDebugLog(`Processing log with level: ${level}`)

            const key = this.formItemKey(level)
            this.internalDebugLog(`Generated log key: ${key}`)

            if (!this.storageInitialized) {
                this.internalDebugLog('Storage not initialized, storing in local object')
                this.localObject = {
                    ...this.localObject,
                    [key]: log
                }
                this.internalDebugLog('Updated local object:', this.localObject)
                return
            }

            this.internalDebugLog('Retrieving logs from storage')
            const storedLogs = await this.getItem(this.storageId)

            this.internalDebugLog('Parsing stored logs')
            const parsedLogs = JSON.parse(storedLogs || '{}')
            this.internalDebugLog('Parsed logs:', parsedLogs)

            parsedLogs[key] = JSON.stringify(log)
            this.internalDebugLog(`Added log to parsedLogs with key: ${key}`)

            this.internalDebugLog('Updating storage with new logs')
            await this.setItem(this.storageId, JSON.stringify(parsedLogs))
            this.internalDebugLog('Storage updated successfully')
        } catch (e) {
            this.internalDebugLog('Error during processLog:', e)
            this._errorMethod(e)
        }
    }

    /**
     * Used to process logs queue.
     * @return Promise<void>
     */
    private async processQueue () {
        this.internalDebugLog('Processing queue')

        // TODO update condition to return also when the logs are emitted to the sockets
        if (this.processing || this.queue.length === 0) {
            this.internalDebugLog(`Queue processing skipped: processing=${this.processing}, queue length=${this.queue.length}`)
            return // Exit if already processing or queue is empty
        }

        const data = this.queue.shift()
        this.internalDebugLog('Dequeued log data:', data)

        if (!data) {
            this.internalDebugLog('No data in queue after shift, returning')
            return // Exit if queue is empty
        }

        this.processing = true
        this.internalDebugLog('Processing flag set')

        this.internalDebugLog('Calling processLog with data:', data)
        await this.processLog(...data)
            .finally(() => {
                this.processing = false
                this.internalDebugLog('Processing flag cleared, continuing queue processing')
                this.processQueue()
            })
    }

    /**
     * Logs info data into the storage
     * @param logData The arguments to be logged.
     * @return void
     */
    public log (logData: DataType): void {
        this.internalDebugLog('log method called with data:', logData)

        if (!this.isLogLevelAllowed(LevelEnum.INFO)) {
            this.internalDebugLog('INFO level not allowed, skipping')
            return
        }

        const additionalData: LoggerBaseData = this.populateMetaData()
        this.internalDebugLog('Additional metadata:', additionalData)

        const log: DataType = {
            ...additionalData,
            ...logData
        }
        this.internalDebugLog('Combined log data:', log)

        const data = [ 'INFO', log ]
        this.internalDebugLog('Prepared log data for queue:', data)

        this.queue.push(data)
        this.internalDebugLog(`Log added to queue, current queue length: ${this.queue.length}`)

        if (this.logToConsole) {
            this.internalDebugLog('Logging to console')
            this._logMethod.apply(globalConsole, [ log ])
        }

        this.internalDebugLog('Initiating queue processing')
        this.processQueue()
    }

    /**
     * Logs warn data into the storage
     * @param logData The arguments to be logged.
     * @return void
     */
    public warn (logData: DataType): void {
        this.internalDebugLog('warn method called with data:', logData)

        if (!this.isLogLevelAllowed(LevelEnum.WARNING)) {
            this.internalDebugLog('WARNING level not allowed, skipping')
            return
        }

        const data = [ 'WARN', logData ]
        this.internalDebugLog('Prepared log data for queue:', data)

        this.queue.push(data)
        this.internalDebugLog(`Log added to queue, current queue length: ${this.queue.length}`)

        if (this.logToConsole) {
            this.internalDebugLog('Logging to console')
            this._warnMethod.apply(globalConsole, [ logData ])
        }

        this.internalDebugLog('Initiating queue processing')
        this.processQueue()
    }

    /**
     * Logs error data into the storage
     * @param logData The arguments to be logged.
     * @return void
     */
    public error (logData: DataType): void {
        this.internalDebugLog('error method called with data:', logData)

        if (!this.isLogLevelAllowed(LevelEnum.ERROR)) {
            this.internalDebugLog('ERROR level not allowed, skipping')
            return
        }

        const data = [ 'ERROR', logData ]
        this.internalDebugLog('Prepared log data for queue:', data)

        this.queue.push(data)
        this.internalDebugLog(`Log added to queue, current queue length: ${this.queue.length}`)

        if (this.logToConsole) {
            this.internalDebugLog('Logging to console')
            this._errorMethod.apply(globalConsole, [ logData ])
        }

        this.internalDebugLog('Initiating queue processing')
        this.processQueue()
    }

    /**
     * Logs debug data into the storage
     * @param logData The arguments to be logged.
     * @return void
     */
    public debug (logData: DataType): void {
        this.internalDebugLog('debug method called with data:', logData)

        if (!this.isLogLevelAllowed(LevelEnum.DEBUG)) {
            this.internalDebugLog('DEBUG level not allowed, skipping')
            return
        }

        const data = [ 'DEBUG', logData ]
        this.internalDebugLog('Prepared log data for queue:', data)

        this.queue.push(data)
        this.internalDebugLog(`Log added to queue, current queue length: ${this.queue.length}`)

        if (this.logToConsole) {
            this.internalDebugLog('Logging to console')
            this._debugMethod.apply(globalConsole, [ logData ])
        }

        this.internalDebugLog('Initiating queue processing')
        this.processQueue()
    }

    /**
     * The default method for getting logs from storage
     * @param storageId The identifier of storage where logs are stored.
     * @return string || null
     */
    private async defaultGetItemFunction (storageId: string): Promise<string | null> {
        this.internalDebugLog(`Default getItem called for storageId: ${storageId}`)
        const result = localStorage.getItem(storageId)
        this.internalDebugLog('Default getItem result:', result)
        return result
    }

    /**
     * The default method for setting logs into the storage
     * @param storageId The identifier of storage where to store the logs.
     * @param logs The logs to be stored.
     * @return void
     */
    private async defaultSetItemFunction (storageId: string, logs: string): Promise<void> {
        this.internalDebugLog(`Default setItem called for storageId: ${storageId}`)
        this.internalDebugLog('Setting logs (truncated):', logs.substring(0, 100) + (logs.length > 100 ? '...' : ''))

        try {
            localStorage.setItem(storageId, logs)
            this.internalDebugLog('localStorage.setItem completed successfully')
        } catch (e) {
            this.internalDebugLog('Error in defaultSetItemFunction:', e)
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
        this.internalDebugLog(`Forming item key for level: ${level}, date: ${date}`)

        this.logIndex++
        this.internalDebugLog(`Current log index: ${this.logIndex}`)

        const key = `${level}-${this.system}-${date}-${this.logIndex}`
        this.internalDebugLog(`Generated key: ${key}`)
        return key
    }
}
