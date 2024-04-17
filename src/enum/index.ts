export const defaultConnectOptions = {
    reconnection: true,
    reconnectionDelay: 5000,
    reconnectionAttempts: 10,
    //perMessageDeflate: false,
    upgrade: false,
    transports: [ 'websocket' ],
    debug: false
}

export const defaultLoggerOptions = {
    logToConsole: true,
    overloadGlobalConsole: false,
    socketEmitInterval: 60000
}

export const ActionNameEnum = {
    CREATE: 'Create',
    READ: 'Read',
    UPDATE: 'Update',
    DELETE: 'Delete',
    CONVERT: 'Convert',
    DOWNLOAD: 'Download',
    UPLOAD: 'Upload',
    ENCRYPT: 'Encrypt',
    DECRYPT: 'Decrypt',
    FILTER: 'Filter',
    INPUT: 'Input',
    OUTPUT: 'Output',
    PLUGIN: 'Plugin',
    LOGIN: 'Login',
    LOGOUT: 'Logout',
    REFRESH: 'Refresh',
    CHECK: 'Check',
    WEBHOOK: 'Webhook',
    WSCONNECT: 'WSConnect',
} as const

export const ActionIDEnum = {
    CREATE: 1,
    READ: 2,
    UPDATE: 3,
    DELETE: 4,
    CONVERT: 5,
    DOWNLOAD: 6,
    UPLOAD: 7,
    ENCRYPT: 8,
    DECRYPT: 9,
    FILTER: 10,
    INPUT: 11,
    OUTPUT: 12,
    PLUGIN: 13,
    LOGIN: 14,
    LOGOUT: 15,
    REFRESH: 16,
    CHECK: 17,
    WEBHOOK: 18,
    WSCONNECT: 19,
} as const

export const LogTypeEnum = {
    INFO: 'info',
    WARNING: 'warning',
    MODIFY: 'modify',
    ERROR: 'error',
    VIEW: 'view'
} as const

export const LevelEnum = {
    INFO: 'info',
    WARNING: 'warning',
    ERROR: 'error',
    DEBUG: 'debug'
} as const

export const IdentityTypeEnum = {
    USER: 'User',
    ACCOUNT: 'Account'
} as const

export const IdentityNameEnum = {
    USER: 'UserName',
    ACCOUNT: 'AccountName',
    EXTENSION: 'ExtensionName'
} as const

export const IdentityIDEnum = {
    USER: 'UserID',
    ACCOUNT: 'AccountID',
    EXTENSION: 'ExtensionID'
} as const

export const EntityIDEnum = {
    USER: 'User ID',
    ACCOUNT: 'Account ID',
    EXTENSION: 'Extension ID',
    CAMPAIGN: 'Campaign ID',
    QUEUE: 'Queue ID'
} as const

export const EntityTypeEnum = {
    USER: 'User',
    ACCOUNT: 'Account',
    EXTENSION: 'Extension',
    CAMPAIGN: 'Campaign',
    QUEUE: 'Queue'
} as const
