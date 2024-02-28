# socketio-storage-logger
`socketio-storage-logger` is a library that allows you to log data into the storage and periodically emit stored logs to the server using `socket.io-client` library functionality.

By default it logs data to the **localstorage** but you can use your own storage by providing methods for getting and setting data to it.

It also allows you to overload the global console logging methods (like `log`, `warn`, `error` etc.) the by passing appropriate property to the logger configuration.

## Install with NPM
```shell
npm install @voicenter-team/socketio-storage-logger --save
```

## Configuration parameters

Parameter | Description |
--- | --- |
`socket` | `SocketIO connection / undefined` **default: undefined**. Defines the initialized socket socket-io connection.
`url` | `string / undefined` **default: undefined**. Defines the socket connection url.
`socketOptions` | `object`. Defines initializing configuration options for socket-io connection.
`loggerOptions` | `LoggerOptions`. Defines the configuration options for logger.

### LoggerOptions interface

Parameter | Description |
--- | --- |
`logToConsole` | `boolean` **default: true**. This defines if logger should contain default behavior like logging data to console.
`overloadGlobalConsole` | `boolean` **default: false**. This defines if the global console object should be overloaded with logger functionality.
`namespace` | `string`. This defines the namespace for the storage key. This value should be unique across the projects.
`socketEmitInterval` | `number` **default: 60000**. This defines the interval for sending logs using sockets in milliseconds.
`getItem` | `(storage: string) => string;`. This defines the custom function for getting logs from storage. Function can be both synchronous or asynchronous.
`setItem` | `(storage: string, logs: string) => void;`. This defines the custom function for setting logs to storage. The second 'logs' parameter should be string or stringified object. Function can be both synchronous or asynchronous.
`parseLog` | `(level: string, logs: any[]) => string;`. This defines the custom function for parsing logs. Function should be synchronous.

## Usage

To start using the library first of all import it:

```js
const StorageLogger = require("@voicenter-team/socketio-storage-logger")
```

or 

```js
import StorageLogger from "@voicenter-team/socketio-storage-logger"
```

When initializing logger you should pass to parameters either `url` and `socketOptions` (which will be used for socket connection) or already initialized socket connection `socket`

Here is an example of creating logger based on `url` and `socketOptions` parameters:

```js
const logger = new StorageLogger({
    url: "https://your-server-domain.com",
    socketOptions: {
        reconnection: true,
        reconnectionDelay: 5000,
        reconnectionAttempts: 10,
        perMessageDeflate: false,
        upgrade: false,
        transports: [ 'websocket' ],
        debug: false
    },
    loggerOptions: {
        namespace: "test-project",
        logToConsole: true,
        overloadGlobalConsole: false,
        socketEmitInterval: 10000
    }
})
```

And here is an example of creating logger based on `socket` parameter:

```js
import io from "socket.io-client"

const url = "https://your-server-domain.com"
const options: {
    reconnection: true,
    reconnectionDelay: 5000,
    reconnectionAttempts: 10,
    perMessageDeflate: false,
    upgrade: false,
    transports: [ 'websocket' ],
    debug: false
}
const socket = io(url, options)

const logger = new StorageLogger({
    socket,
    loggerOptions: {
        namespace: "test-project",
        logToConsole: true,
        overloadGlobalConsole: false,
        socketEmitInterval: 10000
    }
})
```

To use custom storage you should provide getter (`getItem`) and setter (`setItem`) for your storage. Next example shows usage of custom storage on the example of `node-storage`:
```js
const StorageLogger = require("@voicenter-team/socketio-storage-logger")
const Storage = require('node-storage');

const store = new Storage('./logs.json');

function getItem(storageId) {
    return store.get(storageId)
}

function setItem(storageId, logs) {
    store.put(storageId, logs);
}

function parseLog (level, logs) {
    const message = logs.map(log => JSON.stringify(log)).join(' ')
    const time = new Date().toISOString()
    return JSON.stringify({ level, time, message })
}

const logger = new StorageLogger({
    url: "https://your-server-domain.com",
    socketOptions: {
        reconnection: true,
        reconnectionDelay: 5000,
        reconnectionAttempts: 10,
        perMessageDeflate: false,
        upgrade: false,
        transports: [ 'websocket' ],
        debug: false
    },
    loggerOptions: {
        namespace: "test-project",
        logToConsole: true,
        overloadGlobalConsole: false,
        socketEmitInterval: 10000,
        getItem,
        setItem,
        parseLog,
    }
})

logger.log("Test log method")
logger.warn("Test warn method")
logger.error("Test error method")

// Next lines do the same that previuos few as we passed config parameter overloadGlobalConsole as true
console.log("Test log method")
console.warn("Test warn method")
console.error("Test error method")
```

## Usage in Chrome Extension project

First of all import AsyncStorageLogger:
```js
  import StorageLogger from "@voicenter-team/socketio-storage-logger"
```

`localStorage` is not available in background.js so let's create custom getItem and setItem functions:

```js
 import StorageLogger from "@voicenter-team/socketio-storage-logger"

const getItemFunc = async (storageId) => {
    const results = await chrome.storage.local.get(storageId)
    return results[storageId]
}

const setItemFunc = async (storageId, logs) => {
    await chrome.storage.local.set({ [storageId]: logs })
}

const logger = new StorageLogger({
    url: "https://your-server-domain.com",
    socketOptions: {
        reconnection: true,
        reconnectionDelay: 5000,
        reconnectionAttempts: 10,
        perMessageDeflate: false,
        upgrade: false,
        transports: [ 'websocket' ],
        debug: false
    },
    loggerOptions: {
        namespace: "extension-project",
        logToConsole: true,
        overloadGlobalConsole: false,
        socketEmitInterval: 10000,
        getItem: getItemFunc,
        setItem: setItemFunc
    }
})
```
