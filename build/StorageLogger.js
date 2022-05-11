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
const socket_io_client_1 = require("socket.io-client");
const config_1 = __importDefault(require("./config/config"));
const isPromise_1 = require("./helpers/isPromise");
// @ts-ignore
const globalObject = this.window ? this.window : global ? global : undefined;
class StorageLogger {
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
        this._logMethod = globalObject.console.log;
        this._warnMethod = globalObject.console.warn;
        this._errorMethod = globalObject.console.error;
        this._debugMethod = globalObject.console.debug;
        this._initStorage();
        this.initSocketConnection(config.socketUrl);
        if (this._overloadGlobalConsole) {
            this._overloadConsole();
        }
    }
    emitLogs() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._emitInProgress)
                return;
            try {
                const storedLogs = this._getItem(this._storageId);
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
                    const response = yield this.socket.emit("Log", parsedLogs[key]); // logs only value
                    //console.log('response', response);
                    if (response.status === "OK") {
                        keysToReset.push(key);
                    }
                }
                // During emitting sockets new logs could be added
                // To ensure that newly added logs which were added during socket emits will not be lost
                const logs = this._getItem(this._storageId);
                if (!logs)
                    return;
                const allLogs = JSON.parse(logs);
                keysToReset.forEach((key) => delete allLogs[key]);
                // Update storage logs object after socket emits
                this._setItem(this._storageId, JSON.stringify(allLogs));
            }
            catch (err) {
                this._errorMethod(err);
            }
            finally {
                this._emitInProgress = false;
            }
        });
    }
    initSocketConnection(socketUrl) {
        this.socket = (0, socket_io_client_1.io)(socketUrl);
        this._interval = setInterval(() => __awaiter(this, void 0, void 0, function* () {
            yield this.emitLogs();
        }), this.socketEmitInterval);
    }
    disconnectSocket() {
        if (!this.socket || !this._interval)
            return;
        this.socket.disconnect();
        clearInterval(this._interval);
    }
    _overloadConsole() {
        const self = this;
        globalObject.console = Object.assign(globalObject.console, {
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
    _initStorage() {
        const storedLogs = this._getItem(this._storageId);
        if (!storedLogs || typeof storedLogs !== "string") {
            this._setItem(this._storageId, JSON.stringify({}));
        }
    }
    resetStorage() {
        this._setItem(this._storageId, JSON.stringify({}));
    }
    validateConfig(config) {
        if (!config.socketUrl) {
            throw new Error("Config property \"socketUrl\" should be provided!");
        }
        if (!config.namespace) {
            throw new Error("Config property \"namespace\" should be provided!");
        }
        if (config.getItem && typeof config.getItem === 'function') {
            const res = config.getItem('');
            if ((0, isPromise_1.isPromise)(res))
                throw new Error('getItem function should be synchronous!');
        }
        if (config.setItem && typeof config.setItem === 'function') {
            const res = config.setItem('', '');
            if ((0, isPromise_1.isPromise)(res))
                throw new Error('setItem function should be synchronous!');
        }
    }
    getStorageName(namespace, suffix = "_LOGGER_") {
        return namespace.toString().toUpperCase() + suffix + Date.now();
    }
    _processLog(...args) {
        try {
            if (args.length < 2)
                return;
            const level = args[0];
            const logs = args.slice(1);
            const storedLogs = this._getItem(this._storageId);
            if (!storedLogs)
                return;
            const parsedLogs = JSON.parse(storedLogs);
            const key = this.formItemKey(level);
            const message = logs.join(' ');
            const time = new Date().toISOString();
            parsedLogs[key] = JSON.stringify({ level, time, message });
            this._setItem(this._storageId, JSON.stringify(parsedLogs));
        }
        catch (e) {
            this._errorMethod(e);
        }
    }
    log(...args) {
        this._processLog("INFO", ...args);
        if (this._logToConsole) {
            this._logMethod.apply(globalObject.console, args);
        }
    }
    warn(...args) {
        this._processLog("WARN", ...args);
        if (this._logToConsole) {
            this._warnMethod.apply(globalObject.console, args);
        }
    }
    error(...args) {
        this._processLog("ERROR", ...args);
        if (this._logToConsole) {
            this._errorMethod.apply(globalObject.console, args);
        }
    }
    debug(...args) {
        this._processLog("DEBUG", ...args);
        if (this._logToConsole) {
            this._debugMethod.apply(globalObject.console, args);
        }
    }
    _getItemDefault(storageId) {
        return localStorage.getItem(storageId);
    }
    _setItemDefault(storage, logs) {
        try {
            localStorage.setItem(storage, logs);
        }
        catch (e) {
            this._errorMethod(e);
        }
    }
    formItemKey(level) {
        const date = new Date().toISOString();
        this._logIndex++;
        return `${level}-${this.namespace}-${date}-${this._logIndex}`;
    }
}
exports.StorageLogger = StorageLogger;
