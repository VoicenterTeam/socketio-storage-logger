import { SocketOptions } from '../types'

export const defaultConnectOptions: SocketOptions = {
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
    WSCONNECT: 'WSConnect'
} as const

type ActionNameEnumType = typeof ActionNameEnum
export const ActionIDEnum: Record<ActionNameEnumType[keyof ActionNameEnumType], number> = {
    Create: 1,
    Read: 2,
    Update: 3,
    Delete: 4,
    Convert: 5,
    Download: 6,
    Upload: 7,
    Encrypt: 8,
    Decrypt: 9,
    Filter: 10,
    Input: 11,
    Output: 12,
    Plugin: 13,
    Login: 14,
    Logout: 15,
    Refresh: 16,
    Check: 17,
    Webhook: 18,
    WSConnect: 19
}

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
