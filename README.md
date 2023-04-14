# socketio-storage-logger
`socketio-storage-logger` is a library that allows you to log data into the storage and periodically emit stored logs to the server using `socket.io-client` library functionality.

By default it logs data to the **localstorage** but you can use your own storage by providing methods for getting and setting data to it. The only requirement is that these methods should be **synchronous** (For asynchronous see [AsyncStorageLogger](#usage-in-chrome-extension-project)).

It also allows you to overload the global console logging methods (like `log`, `warn`, `error` etc.) the by passing appropriate property to the logger configuration.

## Install with NPM
```shell
npm install @voicenter-team/socketio-storage-logger --save
```

## Configuration parameters

Parameter | Description |
--- | --- |
`logToConsole` | `boolean` **default: true**. This defines if logger should contain default behavior like logging data to console.
`overloadGlobalConsole` | `boolean` **default: false**. This defines if the global console object should be overloaded with logger functionality.
`namespace` | `string`. This defines the namespace for the storage key. This value should be unique across the projects.
`socketConnection` | `socketIo`. This defines the socket connection which will be used for sending logs to the server.
`socketUrl` | `string`. This defines the socket Url used for socket-io connection.
`connectOptions` | `object`. Options for socket connection configuring.
`socketEmitInterval` | `number` **default: 60000**. This defines the interval for sending logs using sockets in milliseconds.
`getItem` | `(storage: string) => string;`. This defines the custom function for getting logs from storage. Function should be synchronous.
`setItem` | `(storage: string, logs: string) => void;`. This defines the custom function for setting logs to storage. Function should be synchronous.
`parseLog` | `(level: string, logs: any[]) => string;`. This defines the custom function for parsing logs. Function should be synchronous.

## Usage

To start using the library first of all import it:

```js
const { StorageLogger } = require("@voicenter-team/socketio-storage-logger")
```

or 

```js
import { StorageLogger } from "@voicenter-team/socketio-storage-logger"
```

and then create instance of the logger:

```js
const logger = new StorageLogger({
    socketUrl: "https://your-server-domain.com",
    connectOptions: {
      reconnection: true,
      reconnectionDelay: 5000,
      transports: ['websocket']
    },
    namespace: "test-project"
})
```

To use custom storage you should provide getter (`getItem`) and setter (`setItem`) for your storage. Next example shows usage of custom storage on the example of `node-storage`:
```js
const { StorageLogger } = require("@voicenter-team/socketio-storage-logger")
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
    socketUrl: "https://your-server-domain.com",
    logToConsole: true,
    overloadGlobalConsole: true,
    namespace: "node-storage-example",
    socketEmitInterval: 10000,
    getItem,
    setItem,
    parseLog,
})

logger.log("Test log method")
logger.warn("Test warn method")
logger.error("Test error method")

// Next lines do the same that previuos few as we passed config parameter overloadGlobalConsole as true
console.log("Test log method")
console.warn("Test warn method")
console.error("Test error method")
```

Sometimes it is useful to forbid logger to create its own socket connection and let it use existing connection. For that use socketConnection property when initializing logger:
```js
const { StorageLogger } = require("@voicenter-team/socketio-storage-logger")

const loggerSocket = io(url, options)

const logger = new StorageLogger({
    socketConnection: loggerSocket,
    namespace: "test-project"
})
```

## Usage in Chrome Extension project

First of all import AsyncStorageLogger:
```js
  import {StorageLogger} from "@voicenter-team/socketio-storage-logger/build/AsyncStorageLogger"
```
Then initialize logger socket and pass it into Logger options. Use `socketConnection` option instead of `socketUrl`
```js
 import {AsyncStorageLogger} from "@voicenter-team/socketio-storage-logger/build/AsyncStorageLogger"

 const loggerSocket = io(serverUrl, loggerConnectOptions)
 
 const logger = new AsyncStorageLogger({
    socketConnection: loggerSocket,
    logToConsole: true,
    overloadGlobalConsole: false,
    namespace: "extension-namespace",
    socketEmitInterval: 10000
  })
```