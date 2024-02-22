"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultLoggerOptions = exports.defaultConnectOptions = void 0;
exports.defaultConnectOptions = {
    reconnection: true,
    reconnectionDelay: 5000,
    reconnectionAttempts: 10,
    perMessageDeflate: false,
    upgrade: false,
    transports: ['websocket'],
    debug: false
};
exports.defaultLoggerOptions = {
    logToConsole: true,
    overloadGlobalConsole: false,
    socketEmitInterval: 60000
};
