export const defaultConnectOptions = {
    reconnection: true,
    reconnectionDelay: 5000,
    reconnectionAttempts: 10,
    perMessageDeflate: false,
    upgrade: false,
    transports: ['websocket'],
    debug: false
}

export const defaultLoggerOptions = {
    logToConsole: true,
    overloadGlobalConsole: false,
    socketEmitInterval: 60000
}
