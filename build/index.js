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
exports.StorageLogger = void 0;
const socket_io_client_1 = __importDefault(require("socket.io-client"));
const isPromise_1 = require("./helpers/isPromise");
const helpers_1 = require("./helpers/helpers");
const enum_1 = require("./enum");
let globalConsole = console;
class StorageLogger {
    /**
     * Initialize storage logger
     * @param config The configuration of the logger.
     */
    constructor(options) {
        var _a, _b;
        const { loggerOptions } = options;
        if (!loggerOptions.namespace) {
            throw new Error('Config property \'namespace\' should be provided!');
        }
        this.setupStorageFunctions(loggerOptions.getItem, loggerOptions.setItem, loggerOptions.parseLog);
        this.namespace = loggerOptions.namespace;
        this.socketEmitInterval = loggerOptions.socketEmitInterval || enum_1.defaultLoggerOptions.socketEmitInterval;
        this.logToConsole = (_a = loggerOptions.logToConsole) !== null && _a !== void 0 ? _a : enum_1.defaultLoggerOptions.logToConsole;
        this.overloadGlobalConsole = (_b = loggerOptions.overloadGlobalConsole) !== null && _b !== void 0 ? _b : enum_1.defaultLoggerOptions.overloadGlobalConsole;
        this.storageId = this.getStorageName(loggerOptions.namespace);
        this.queue = [];
        this.processing = false;
        this.emitInProgress = false;
        this.logIndex = 0;
        this.init(options);
    }
    setupStorageFunctions(getItemFunction, setItemFunction, parseLogFunction) {
        this.getItem =
            getItemFunction && typeof getItemFunction === 'function' ?
                this.promisifyStorageFunction(getItemFunction) :
                this.defaultGetItemFunction;
        this.setItem =
            setItemFunction && typeof setItemFunction === 'function' ?
                this.promisifyStorageFunction(setItemFunction) :
                this.defaultSetItemFunction;
        this.parseLog =
            parseLogFunction && typeof parseLogFunction === 'function' ?
                parseLogFunction :
                helpers_1.parseLogDefault;
    }
    promisifyStorageFunction(f) {
        if (f && typeof f === 'function') {
            const result = f('');
            const isSync = !(0, isPromise_1.isPromise)(result);
            if (isSync) {
                return (...args) => __awaiter(this, void 0, void 0, function* () {
                    return new Promise((resolve, reject) => {
                        try {
                            const data = f(...args);
                            resolve(data);
                        }
                        catch (err) {
                            reject(err);
                        }
                    });
                });
            }
            return f;
        }
    }
    /**
     * Used to initialize logger. Initializes storage, establishes socket connection and overloads console if needed
     * @param config The logger config.
     * @return void
     */
    init(options) {
        const { socket, url, socketOptions = {} } = options;
        this._logMethod = globalConsole.log;
        this._warnMethod = globalConsole.warn;
        this._errorMethod = globalConsole.error;
        this._debugMethod = globalConsole.debug;
        this.initStorage().then(() => {
            if (socket) {
                this.socket = socket;
            }
            else if (url) {
                this.socket = this.createConnection(url, socketOptions);
            }
            else {
                throw new Error('Must provide either a \'socket\' or a \'url\' for socket connection');
            }
            this.interval = setInterval(() => __awaiter(this, void 0, void 0, function* () {
                yield this.emitLogs();
            }), this.socketEmitInterval);
            if (this.overloadGlobalConsole) {
                this._overloadConsole();
            }
        });
    }
    /**
     * Used to initialize new socket connection
     * @param socketUrl The url used for the socket connection.
     * @return void
     */
    createConnection(url, options = {}) {
        const connectOptions = Object.assign(Object.assign({}, enum_1.defaultConnectOptions), options);
        return (0, socket_io_client_1.default)(url, connectOptions);
    }
    /**
     * Emits stored logs to the server and clears the log storage in case the emit operation was successful
     * @return {Promise<void>}
     */
    emitLogs() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.emitInProgress)
                return;
            try {
                const storedLogs = yield this.getItem(this.storageId);
                if (!storedLogs)
                    return;
                let keysToReset = [];
                this.emitInProgress = true;
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
                const logs = yield this.getItem(this.storageId);
                if (!logs)
                    return;
                const logsToStore = (0, helpers_1.removeLogsByKeys)(logs, keysToReset);
                // Update storage logs object after socket emits
                yield this.setItem(this.storageId, JSON.stringify(logsToStore));
            }
            catch (err) {
                this._errorMethod(err);
            }
            finally {
                this.emitInProgress = false;
            }
        });
    }
    /**
     * Used to interrupt socket connection
     * @return void
     */
    disconnectSocket() {
        if (!this.socket || !this.interval)
            return;
        this.socket.disconnect();
        clearInterval(this.interval);
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
    initStorage() {
        return __awaiter(this, void 0, void 0, function* () {
            const storedLogs = yield this.getItem(this.storageId);
            if (!storedLogs || typeof storedLogs !== "string") {
                yield this.setItem(this.storageId, JSON.stringify({}));
            }
        });
    }
    /**
     * Reset log storage
     * @return void
     */
    resetStorage() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.setItem(this.storageId, JSON.stringify({}));
        });
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
    processLog(...args) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (args.length < 2)
                    return;
                const storedLogs = yield this.getItem(this.storageId);
                if (!storedLogs)
                    return;
                const { level, logs } = (0, helpers_1.getLogData)(args);
                const parsedLogs = JSON.parse(storedLogs);
                const key = this.formItemKey(level);
                parsedLogs[key] = this.parseLog(level, logs);
                yield this.setItem(this.storageId, JSON.stringify(parsedLogs));
            }
            catch (e) {
                this._errorMethod(e);
            }
        });
    }
    processQueue() {
        return __awaiter(this, void 0, void 0, function* () {
            // TODO update condition to return also when the logs are emitted to the sockets
            if (this.processing || this.queue.length === 0) {
                return; // Exit if already processing or queue is empty
            }
            this.processing = true;
            const data = this.queue.shift();
            yield this.processLog(data)
                .finally(() => {
                this.processing = false;
                this.processQueue();
            });
        });
    }
    /**
     * Logs info data into the storage
     * @param arguments The arguments to be logged.
     * @return void
     */
    log(...args) {
        const data = ['INFO', ...args];
        this.queue.push(data);
        if (this.logToConsole) {
            this._logMethod.apply(globalConsole, args);
        }
        this.processQueue();
    }
    /**
     * Logs warn data into the storage
     * @param arguments The arguments to be logged.
     * @return void
     */
    warn(...args) {
        const data = ['WARN', ...args];
        this.queue.push(data);
        if (this.logToConsole) {
            this._warnMethod.apply(globalConsole, args);
        }
        this.processQueue();
    }
    /**
     * Logs error data into the storage
     * @param arguments The arguments to be logged.
     * @return void
     */
    error(...args) {
        const data = ['ERROR', ...args];
        this.queue.push(data);
        if (this.logToConsole) {
            this._errorMethod.apply(globalConsole, args);
        }
        this.processQueue();
    }
    /**
     * Logs debug data into the storage
     * @param arguments The arguments to be logged.
     * @return void
     */
    debug(...args) {
        const data = ['DEBUG', ...args];
        this.queue.push(data);
        if (this.logToConsole) {
            this._debugMethod.apply(globalConsole, args);
        }
        this.processQueue();
    }
    /**
     * The default method for getting logs from storage
     * @param storageId The identifier of storage where logs are stored.
     * @return string || null
     */
    defaultGetItemFunction(storageId) {
        return __awaiter(this, void 0, void 0, function* () {
            return localStorage.getItem(storageId);
            // @ts-ignore
            /*const results = await chrome.storage.local.get(storageId)
            return results[storageId]*/
        });
    }
    /**
     * The default method for setting logs into the storage
     * @param storageId The identifier of storage where to store the logs.
     * @param logs The logs to be stored.
     * @return void
     */
    defaultSetItemFunction(storageId, logs) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                localStorage.setItem(storageId, logs);
            }
            catch (e) {
                this._errorMethod(e);
            }
            /*try {
                // @ts-ignore
                await chrome.storage.local.set({[storageId]: logs})
            } catch (e) {
                this._errorMethod(e)
            }*/
        });
    }
    /**
     * Used to form a key which will be used to store a log in the storage
     * @param level The log level. For example: Info, Warn, Error etc..
     * @return string
     */
    formItemKey(level) {
        const date = new Date().toISOString();
        this.logIndex++;
        return `${level}-${this.namespace}-${date}-${this.logIndex}`;
    }
}
exports.StorageLogger = StorageLogger;
