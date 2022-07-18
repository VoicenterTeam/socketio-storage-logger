"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AsyncStorageLogger = void 0;
const config_1 = __importDefault(require("./config/config"));
const isPromise_1 = require("./helpers/isPromise");
const helpers_1 = require("./helpers/helpers");
let globalConsole = console;
class AsyncStorageLogger {
    /**
     * Initialize storage logger
     * @param config The configuration of the logger.
     */
    constructor(config) {
        var _a, _b;
        this.validateConfig(config);
        this._logToConsole = (_a = config.logToConsole) !== null && _a !== void 0 ? _a : config_1.default.DEFAULT_LOG_TO_CONSOLE;
        this._overloadGlobalConsole = (_b = config.overloadGlobalConsole) !== null && _b !== void 0 ? _b : config_1.default.DEFAULT_OVERLOAD_CONSOLE;
        this.namespace = config.namespace;
        this.socketEmitInterval = config.socketEmitInterval || config_1.default.DEFAULT_SOCKET_EMIT_INTERVAL;
        this._storageId = this.getStorageName(config.namespace);
        this._emitInProgress = false;
        this._logIndex = 0;
        this._getItem = config.getItem && typeof config.getItem === 'function' ? config.getItem : this._getItemDefault;
        this._setItem = config.setItem && typeof config.setItem === 'function' ? config.setItem : this._setItemDefault;
        this._logMethod = globalConsole.log;
        this._warnMethod = globalConsole.warn;
        this._errorMethod = globalConsole.error;
        this._debugMethod = globalConsole.debug;
        this.initLogger(config);
    }
    /**
     * Used to initialize logger. Initializes storage, establishes socket connection and overloads console if needed
     * @param config The logger config.
     * @return void
     */
    initLogger(config) {
        this._initStorage();
        this.initSocketConnection(config.socketConnection);
        if (this._overloadGlobalConsole) {
            this._overloadConsole();
        }
    }
    /**
     * Emits stored logs to the server and clears the log storage in case the emit operation was successful
     * @return {Promise<void>}
     */
    emitLogs() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._emitInProgress)
                return;
            try {
                const storedLogs = yield this._getItem(this._storageId);
                if (!storedLogs)
                    return;
                let keysToReset = [];
                this._emitInProgress = true;
                const parsedLogs = JSON.parse(storedLogs);
                let keys = Object.keys(parsedLogs);
                if (!keys.length)
                    return;
                if (!this.socket || !this.socket.connected)
                    throw new Error("Socket is disconnected");
                for (const key of keys) {
                    yield this.socket.emit("Log", parsedLogs[key]); // logs only value
                    keysToReset.push(key);
                }
                // During emitting sockets new logs could be added
                // To ensure that newly added logs which were added during socket emits will not be lost
                const logs = yield this._getItem(this._storageId);
                if (!logs)
                    return;
                const logsToStore = (0, helpers_1.getLogsToStore)(logs, keysToReset);
                // Update storage logs object after socket emits
                yield this._setItem(this._storageId, JSON.stringify(logsToStore));
            }
            catch (err) {
                this._errorMethod(err);
            }
            finally {
                this._emitInProgress = false;
            }
        });
    }
    /**
     * Used to initialize new socket connection
     * @param socketUrl The url used for the socket connection.
     * @return void
     */
    initSocketConnection(socketConnection) {
        this.socket = socketConnection;
        this._interval = setInterval(() => __awaiter(this, void 0, void 0, function* () {
            yield this.emitLogs();
        }), this.socketEmitInterval);
    }
    /**
     * Used to interrupt socket connection
     * @return void
     */
    disconnectSocket() {
        if (!this.socket || !this._interval)
            return;
        this.socket.disconnect();
        clearInterval(this._interval);
    }
    /**
     * Used to overload the global console object by logger methods.
     * @return void
     */
    _overloadConsole() {
        const self = this;
        globalConsole = Object.assign(globalConsole, {
            log: function () {
                // @ts-ignore
                self.log(...arguments);
            },
            warn: function () {
                // @ts-ignore
                self.warn(...arguments);
            },
            error: function () {
                // @ts-ignore
                self.error(...arguments);
            },
            debug: function () {
                // @ts-ignore
                self.debug(...arguments);
            }
        });
    }
    /**
     * Used to initialize the storage if it wasn't created before.
     * @return void
     */
    _initStorage() {
        return __awaiter(this, void 0, void 0, function* () {
            const storedLogs = yield this._getItem(this._storageId);
            if (!storedLogs || typeof storedLogs !== "string") {
                yield this._setItem(this._storageId, JSON.stringify({}));
            }
        });
    }
    /**
     * Reset log storage
     * @return void
     */
    resetStorage() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._setItem(this._storageId, JSON.stringify({}));
        });
    }
    /**
     * Validate logger configuration parameters
     * @param config The configuration of the logger.
     * @return void
     */
    validateConfig(config) {
        if (!config.socketConnection) {
            throw new Error("Config property \"socketConnection\" should be provided!");
        }
        if (!config.namespace) {
            throw new Error("Config property \"namespace\" should be provided!");
        }
        if (config.getItem && typeof config.getItem === 'function') {
            const res = config.getItem('');
            if (!(0, isPromise_1.isPromise)(res))
                throw new Error('getItem function should be asynchronous!');
        }
        if (config.setItem && typeof config.setItem === 'function') {
            const res = config.setItem('', '');
            if (!(0, isPromise_1.isPromise)(res))
                throw new Error('setItem function should be asynchronous!');
        }
    }
    /**
     * Get storage name which is used to access the logs storage
     * @param suffix The custom suffix for the storage name.
     * @return string
     */
    getStorageName(suffix = "_LOGGER_") {
        return this.namespace.toString().toUpperCase() + suffix + Date.now();
    }
    /**
     * Does common logic for logging data.
     * @param arguments The arguments of the log where the first argument contains the log level and other
     * arguments are logs to be stored
     * @return void
     */
    _processLog(...args) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (args.length < 2)
                    return;
                const storedLogs = yield this._getItem(this._storageId);
                if (!storedLogs)
                    return;
                const { level, logs } = (0, helpers_1.getLogData)(args);
                const parsedLogs = JSON.parse(storedLogs);
                const key = this.formItemKey(level);
                parsedLogs[key] = (0, helpers_1.parseLog)(level, logs);
                yield this._setItem(this._storageId, JSON.stringify(parsedLogs));
            }
            catch (e) {
                this._errorMethod(e);
            }
        });
    }
    /**
     * Logs info data into the storage
     * @param arguments The arguments to be logged.
     * @return void
     */
    log(...args) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._processLog("INFO", ...args);
            if (this._logToConsole) {
                this._logMethod.apply(globalConsole, args);
            }
        });
    }
    /**
     * Logs warn data into the storage
     * @param arguments The arguments to be logged.
     * @return void
     */
    warn(...args) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._processLog("WARN", ...args);
            if (this._logToConsole) {
                this._warnMethod.apply(globalConsole, args);
            }
        });
    }
    /**
     * Logs error data into the storage
     * @param arguments The arguments to be logged.
     * @return void
     */
    error(...args) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._processLog("ERROR", ...args);
            if (this._logToConsole) {
                this._errorMethod.apply(globalConsole, args);
            }
        });
    }
    /**
     * Logs debug data into the storage
     * @param arguments The arguments to be logged.
     * @return void
     */
    debug(...args) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._processLog("DEBUG", ...args);
            if (this._logToConsole) {
                this._debugMethod.apply(globalConsole, args);
            }
        });
    }
    /**
     * The default method for getting logs from storage
     * @param storageId The identifier of storage where logs are stored.
     * @return string || null
     */
    _getItemDefault(storageId) {
        return __awaiter(this, void 0, void 0, function* () {
            // @ts-ignore
            const results = yield chrome.storage.local.get(storageId);
            return results[storageId];
        });
    }
    /**
     * The default method for setting logs into the storage
     * @param storageId The identifier of storage where to store the logs.
     * @param logs The logs to be stored.
     * @return void
     */
    _setItemDefault(storageId, logs) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // @ts-ignore
                yield chrome.storage.local.set({ [storageId]: logs });
            }
            catch (e) {
                this._errorMethod(e);
            }
        });
    }
    /**
     * Used to form a key which will be used to store a log in the storage
     * @param level The log level. For example: Info, Warn, Error etc..
     * @return string
     */
    formItemKey(level) {
        const date = new Date().toISOString();
        this._logIndex++;
        return `${level}-${this.namespace}-${date}-${this._logIndex}`;
    }
}
exports.AsyncStorageLogger = AsyncStorageLogger;
