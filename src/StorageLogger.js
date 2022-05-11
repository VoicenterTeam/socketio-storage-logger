const io = require('socket.io-client');

const {
    DEFAULT_OVERLOAD_CONSOLE,
    DEFAULT_LOG_TO_CONSOLE,
    DEFAULT_SOCKET_EMIT_INTERVAL
} = require('./config/config')
const {isPromise} = require("./helpers/isPromise")

const globalObject = this.window ? this.window : global ? global : undefined

class StorageLogger {
    constructor(config = {}) {
        this.validateConfig(config)
        this._logToConsole = config.logToConsole ?? DEFAULT_LOG_TO_CONSOLE
        this._overloadGlobalConsole = config.overloadGlobalConsole ?? DEFAULT_OVERLOAD_CONSOLE
        this.namespace = config.namespace
        this.socketEmitInterval = config.socketEmitInterval || DEFAULT_SOCKET_EMIT_INTERVAL
        this._storageId = this.getStorageName(config.namespace)
        this._emitInProgress = false

        this._logIndex = 0

        this._getItem = config.getItem && typeof config.getItem === 'function' ? config.getItem : this._getItemDefault
        this._setItem = config.setItem && typeof config.setItem === 'function' ? config.setItem : this._setItemDefault

        this._logMethod = globalObject.console.log;
        this._warnMethod = globalObject.console.warn;
        this._errorMethod = globalObject.console.error;
        this._debugMethod = globalObject.console.debug;

        this._initStorage()
        this.initSocketConnection(config.socketUrl)

        if (this._overloadGlobalConsole) {
            this._overloadConsole()
        }
    }

    async emitLogs() {
        if (this._emitInProgress) return
        try {
            let keysToReset = []
            this._emitInProgress = true
            const storedLogs = JSON.parse(this._getItem(this._storageId))
            let keys = Object.keys(storedLogs)
            if (!keys.length) return
            if (!this.socket || !this.socket.connected) throw new Error("Socket is disconnected")

            for (const key of keys) {
                const response = await this.socket.emit("Log", storedLogs[key]); // logs only value
                console.log('response', response);
                if (response.status === "OK") {
                    keysToReset.push(key)
                }
            }

            // During emitting sockets new logs could be added
            // To ensure that newly added logs which were added during socket emits will not be lost
            const allLogs = JSON.parse(this._getItem(this._storageId))
            keysToReset.forEach((key) => delete allLogs[key])

            // Update storage logs object after socket emits
            this._setItem(this._storageId, JSON.stringify(allLogs))
        } catch (err) {
            this._errorMethod(err)
        } finally {
            this._emitInProgress = false
        }
    }

    initSocketConnection(socketUrl) {
        this.socket = io(socketUrl);
        this._interval = setInterval(async () => {
            await this.emitLogs()
        }, this.socketEmitInterval)
    }

    disconnectSocket() {
        this.socket.disconnect()
        clearInterval(this._interval)
    }

    _overloadConsole() {
        const self = this;
        globalObject.console = Object.assign(globalObject.console, {
            log: function () {
                self.log(...arguments)
            },
            warn: function () {
                self.warn(...arguments)
            },
            error: function () {
                self.error(...arguments)
            },
            debug: function () {
                self.debug(...arguments)
            }
        })
    }

    _initStorage() {
        const storedLogs = this._getItem(this._storageId)

        if (!storedLogs || typeof storedLogs !== "string") {
            this._setItem(this._storageId, JSON.stringify({}))
        }
    }

    resetStorage() {
        this._setItem(this._storageId, JSON.stringify({}))
    }

    validateConfig(config) {
        if (!config.socketUrl) {
            throw new Error("Config property \"socketUrl\" should be provided!")
        }

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

    getStorageName(namespace, suffix = "_LOGGER_") {
        return namespace.toString().toUpperCase() + suffix + Date.now()
    }

    _processLog() {
        try {
            const args = Array.from(arguments)
            const level = args[0]
            const logs = args.slice(1)

            const storedLogs = JSON.parse(this._getItem(this._storageId))
            const key = this.formItemKey(level)

            const message = logs.join(' ')
            const time = new Date().toISOString()

            storedLogs[key] = JSON.stringify({level, time, message})
            this._setItem(this._storageId, JSON.stringify(storedLogs))
        } catch (e) {
            this._errorMethod(e)
        }
    }

    log() {
        this._processLog("INFO", ...arguments)
        if (this._logToConsole) {
            this._logMethod.apply(globalObject.console, arguments)
        }
    }

    warn() {
        this._processLog("WARN", ...arguments)
        if (this._logToConsole) {
            this._warnMethod.apply(globalObject.console, arguments)
        }
    }

    error() {
        this._processLog("ERROR", ...arguments)
        if (this._logToConsole) {
            this._errorMethod.apply(globalObject.console, arguments)
        }
    }

    debug() {
        this._processLog("DEBUG", ...arguments)
        if (this._logToConsole) {
            this._debugMethod.apply(globalObject.console, arguments)
        }
    }

    _getItemDefault(storageId) {
        return localStorage.getItem(storageId)
    }

    _setItemDefault(storage, logs) {
        try {
            localStorage.setItem(storage, logs);
        } catch (e) {
            this._errorMethod(e)
        }
    }

    formItemKey(level) {
        const date = new Date().toISOString()
        this._logIndex++
        return `${level}-${this.namespace}-${date}-${this._logIndex}`
    }
}

module.exports = StorageLogger;