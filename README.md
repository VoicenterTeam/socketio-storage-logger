# socketio-storage-logger

`socketio-storage-logger` is a library that allows you to log data into storage and periodically emit stored logs to the server using `socket.io-client` or HTTP requests.

The library uses a **storage worker pattern** that provides a consistent interface for different storage backends. You must provide a storage worker appropriate for your environment - the library does not make assumptions about the runtime environment.

## Features

- ✅ **Cross-platform** - Works in browsers, Node.js, service workers, etc.
- ✅ **Flexible storage** - Support for any storage backend via storage workers
- ✅ **Auto migration** - Automatically recovers orphaned logs from previous sessions
- ✅ **Dual transport** - Send logs via WebSocket or HTTP requests
- ✅ **Console overload** - Optionally intercept global console methods
- ✅ **Log levels** - Filter logs by severity level
- ✅ **TypeScript** - Full TypeScript support with type definitions

## Install with NPM

```shell
npm install @voicenter-team/socketio-storage-logger --save
```

## Configuration Parameters

| Parameter       | Description                                                                                             |
|-----------------|---------------------------------------------------------------------------------------------------------|
| `socket`        | `SocketIO connection / undefined` **default: undefined**. Defines the initialized socket.io connection. |
| `url`           | `string / undefined` **default: undefined**. Defines the socket connection URL.                         |
| `requestUrl`    | `string / undefined` **default: undefined**. Defines the URL for HTTP log requests.                     |
| `socketOptions` | `object`. Defines configuration options for socket.io connection.                                       |
| `loggerOptions` | `LoggerOptions`. **Required**. Defines the configuration options for logger.                            |

### LoggerOptions Interface

| Parameter               | Description                                                                                |
|-------------------------|--------------------------------------------------------------------------------------------|
| `logToConsole`          | `boolean` **default: true**. Whether logger should log data to console.                    |
| `overloadGlobalConsole` | `boolean` **default: false**. Whether to overload global console methods.                  |
| `system`                | `string` **Required**. System identifier for storage keys. Must be unique across projects. |
| `socketEmitInterval`    | `number` **default: 60000**. Interval for sending logs in milliseconds.                    |
| `storageWorker`         | `StorageWorkerConstructor` **Required**. Storage worker class for your environment.        |
| `loggerLevel`           | `Level` **default: 'debug'**. Minimum log level to process.                                |
| `staticObject`          | `LoggerDataPartial`. Static data included in every log.                                    |
| `debugPrefix`           | `string`. Prefix for internal debug logs.                                                  |

## Storage Workers

The library provides a `LocalStorageWorker` for browser environments. For other environments, you can create custom storage workers by extending `BaseStorageWorker`.

### Available Storage Workers

- **`LocalStorageWorker`** - For browser environments using localStorage

## Usage

### Basic Browser Usage

```typescript
import StorageLogger, { LocalStorageWorker } from "@voicenter-team/socketio-storage-logger"

const logger = new StorageLogger({
    url: "https://your-server-domain.com",
    socketOptions: {
        reconnection: true,
        reconnectionDelay: 5000,
        reconnectionAttempts: 10,
        upgrade: false,
        transports: ['websocket'],
        debug: false
    },
    loggerOptions: {
        system: "my-web-app",
        storageWorker: LocalStorageWorker,
        logToConsole: true,
        overloadGlobalConsole: false,
        socketEmitInterval: 10000
    }
})
```

### Using HTTP Requests Instead of WebSocket

```typescript
import StorageLogger, { LocalStorageWorker } from "@voicenter-team/socketio-storage-logger"

const logger = new StorageLogger({
    requestUrl: "https://your-server-domain.com/api/logs",
    loggerOptions: {
        system: "my-web-app",
        storageWorker: LocalStorageWorker,
        logToConsole: true,
        socketEmitInterval: 30000
    }
})
```

### Using Existing Socket Connection

```typescript
import StorageLogger, { LocalStorageWorker } from "@voicenter-team/socketio-storage-logger"
import io from "socket.io-client"

const socket = io("https://your-server-domain.com", {
    reconnection: true,
    reconnectionDelay: 5000,
    reconnectionAttempts: 10,
    transports: ['websocket']
})

const logger = new StorageLogger({
    socket,
    loggerOptions: {
        system: "my-web-app",
        storageWorker: LocalStorageWorker,
        logToConsole: true,
        socketEmitInterval: 10000
    }
})
```

### Logging Messages

```typescript
// Log different severity levels
logger.log({ message: "User logged in", userId: 123 })
logger.warn({ message: "API rate limit approaching", requests: 95 })
logger.error({ message: "Database connection failed", error: "Timeout" })
logger.debug({ message: "Processing user data", step: "validation" })
```

### Console Overloading

Enable console overloading to automatically capture all console calls:

```typescript
const logger = new StorageLogger({
    url: "https://your-server-domain.com",
    loggerOptions: {
        system: "my-app",
        storageWorker: LocalStorageWorker,
        logToConsole: true,
        overloadGlobalConsole: true, // Enable console overloading
        socketEmitInterval: 10000
    }
})

// Now these console calls will be captured and sent to the server
console.log("This will be captured by the logger")
console.warn("This warning will be stored and sent") 
console.error("This error will be stored and sent")
console.debug("This debug info will be stored and sent")

// The original console behavior is preserved - logs still appear in browser console
// But they're also stored and sent to your server
```

## Custom Storage Workers

### Node.js File System Example

```typescript
import StorageLogger, { BaseStorageWorker, DebugLogFunction } from "@voicenter-team/socketio-storage-logger"
import fs from 'fs/promises'
import path from 'path'

class FileSystemStorageWorker extends BaseStorageWorker {
    private logDir = './logs'

    constructor(debugLog: DebugLogFunction) {
        super(debugLog)
        this.ensureLogDir()
    }

    private async ensureLogDir() {
        try {
            await fs.mkdir(this.logDir, { recursive: true })
        } catch (error) {
            this.debugLog('Error creating log directory:', error)
        }
    }

    async getItem(key: string): Promise<string | null> {
        try {
            const filePath = path.join(this.logDir, `${key}.json`)
            const data = await fs.readFile(filePath, 'utf8')
            return data
        } catch (error: any) {
            if (error.code === 'ENOENT') return null
            throw error
        }
    }

    async setItem(key: string, value: string): Promise<void> {
        const filePath = path.join(this.logDir, `${key}.json`)
        await fs.writeFile(filePath, value, 'utf8')
    }

    async removeItem(key: string): Promise<void> {
        try {
            const filePath = path.join(this.logDir, `${key}.json`)
            await fs.unlink(filePath)
        } catch (error: any) {
            if (error.code !== 'ENOENT') throw error
        }
    }

    async getAllKeys(): Promise<string[]> {
        try {
            const files = await fs.readdir(this.logDir)
            return files
                .filter(file => file.endsWith('.json'))
                .map(file => file.replace('.json', ''))
        } catch (error) {
            return []
        }
    }
}

const logger = new StorageLogger({
    requestUrl: "https://your-server-domain.com/api/logs",
    loggerOptions: {
        system: "my-node-app",
        storageWorker: FileSystemStorageWorker,
        socketEmitInterval: 30000
    }
})
```

### Chrome Extension Background Script

```typescript
import StorageLogger, { BaseStorageWorker, DebugLogFunction } from "@voicenter-team/socketio-storage-logger"

class ChromeStorageWorker extends BaseStorageWorker {
    constructor(debugLog: DebugLogFunction) {
        super(debugLog)
    }

    async getItem(key: string): Promise<string | null> {
        this.debugLog(`[ChromeStorage] Getting item for key: ${key}`)
        
        const results = await chrome.storage.local.get(key)
        return results[key] || null
    }

    async setItem(key: string, value: string): Promise<void> {
        this.debugLog(`[ChromeStorage] Setting item for key: ${key}`)
        
        await chrome.storage.local.set({ [key]: value })
    }

    async removeItem(key: string): Promise<void> {
        this.debugLog(`[ChromeStorage] Removing item for key: ${key}`)
        
        await chrome.storage.local.remove(key)
    }

    async getAllKeys(): Promise<string[]> {
        this.debugLog('[ChromeStorage] Getting all keys')
        
        const allItems = await chrome.storage.local.get(null)
        return Object.keys(allItems)
    }
}

const logger = new StorageLogger({
    url: "https://your-server-domain.com",
    loggerOptions: {
        system: "my-extension",
        storageWorker: ChromeStorageWorker,
        logToConsole: true,
        socketEmitInterval: 10000
    }
})
```

### Redis Storage Example

```typescript
import StorageLogger, { BaseStorageWorker, DebugLogFunction } from "@voicenter-team/socketio-storage-logger"
import Redis from 'ioredis'

class RedisStorageWorker extends BaseStorageWorker {
    private redis: Redis

    constructor(debugLog: DebugLogFunction, redisUrl: string) {
        super(debugLog)
        this.redis = new Redis(redisUrl)
    }

    async getItem(key: string): Promise<string | null> {
        this.debugLog(`[Redis] Getting item for key: ${key}`)
        return await this.redis.get(key)
    }

    async setItem(key: string, value: string): Promise<void> {
        this.debugLog(`[Redis] Setting item for key: ${key}`)
        await this.redis.set(key, value)
    }

    async removeItem(key: string): Promise<void> {
        this.debugLog(`[Redis] Removing item for key: ${key}`)
        await this.redis.del(key)
    }

    async getAllKeys(): Promise<string[]> {
        this.debugLog('[Redis] Getting all keys')
        return await this.redis.keys('*')
    }
}

const logger = new StorageLogger({
    requestUrl: "https://your-server-domain.com/api/logs",
    loggerOptions: {
        system: "my-microservice",
        storageWorker: (debugLog) => new RedisStorageWorker(debugLog, 'redis://localhost:6379'),
        socketEmitInterval: 15000
    }
})
```

## Advanced Features

### Debug Logging

Enable internal debug logging to see what the logger is doing:

```typescript
const logger = new StorageLogger({
    // ... configuration
    loggerOptions: {
        system: "my-app",
        storageWorker: LocalStorageWorker,
        debugPrefix: "MyApp" // Custom debug prefix
    }
})

// Enable debug logging
logger.toggleDebugLogging(true)

// Now you'll see internal debug messages in the console
logger.log({ message: "Test log" })
```

### Log Levels

Control which logs are processed and sent to the server:

```typescript
const logger = new StorageLogger({
    // ... configuration
    loggerOptions: {
        system: "my-app",
        storageWorker: LocalStorageWorker,
        loggerLevel: "warning" // Only warning and error logs will be sent
    }
})

// These will be ignored (below warning level)
logger.debug({ message: "Debug info" })  // Ignored
logger.log({ message: "Info message" })  // Ignored

// These will be processed and sent
logger.warn({ message: "Warning message" })  // Sent ✅
logger.error({ message: "Error occurred" })  // Sent ✅

// Change log level at runtime
logger.changeLogLevel("debug") // Now all logs will be sent
```

### Static Fields

Add data that will be included in every log:

```typescript
// Set static fields that appear in every log
logger.setupStaticFields({
    version: "1.2.3",
    environment: "production",
    userId: "user123"
})

// Update static fields
logger.updateStaticFields({
    sessionId: "session456"
})

// Now every log will include these fields
logger.log({ message: "Button clicked" })
// Sent log will include: version, environment, userId, sessionId + message
```

### Manual Control

```typescript
// Stop the logger (useful for cleanup)
await logger.stop()

// Restart the logger
await logger.start()

// Manually emit logs (force send now)
await logger.emitLogs()

// Reset storage (clear all stored logs)
await logger.resetStorage()
```

## Migration & Recovery

The logger automatically handles log migration when the page refreshes or the application restarts. It will:

1. **Find old log storage keys** from previous sessions
2. **Migrate all logs** to the current session's storage
3. **Clean up old storage keys** to prevent bloat
4. **Preserve original log structure** for seamless processing

This ensures no logs are ever lost due to page refreshes or application restarts.

## TypeScript Support

The library is written in TypeScript and provides full type definitions:

```typescript
import StorageLogger, { 
    LocalStorageWorker, 
    BaseStorageWorker, 
    DebugLogFunction,
    LoggerOptions,
    ConfigOptions 
} from "@voicenter-team/socketio-storage-logger"

// Fully typed configuration
const config: ConfigOptions = {
    url: "https://example.com",
    loggerOptions: {
        system: "my-app",
        storageWorker: LocalStorageWorker,
        loggerLevel: "info"
    }
}

const logger = new StorageLogger(config)
```
