# localstorage-logger-SocketIO
Logging library for writing to and exporting from local storage.
and exporting it to an SocketIO Server .
Best Choise is :
https://github.com/voicenter/paStash/blob/master/lib/inputs/input_socketio.js
## What is it?

This JavaScript library provides a mechanism to log to local storage and export the most recent entries. It will overwrite the oldest entries when writing a new entry if adding the entry makes the log bigger than `maxLogSizeInBytes`.
## Install with NPM
```
npm install voicenter/localstorage-logger-socketio --save
```
## Motivation
At the time of writing, all the libraries we could find that provide logging or queuing in local storage used a single storage key. This means that they had to serialize the whole log/queue on any modification. This resulted in worse performance as the log got bigger.

Instead of a single key, we use many keys. Therefore, the cost of serialization on each modification is much lower than in the other libraries we found. However, this means we lose atomicity when making modifications to the underlying data structure. JavaScript is single-threaded so this doesn't pose much of a problem but theoretically a browser crash at exactly the right moment could corrupt the underlying data structure built on top of local storage.

## Usage

This is how you can use the logging functionality:

```
import createLog from 'localstorage-logger';

import io from 'socket.io-client';
const socketLogger = io("http://127.0.0.1:8080");

const log = createLog({
  logName: 'my-app-log-name',
  maxLogSizeInBytes: 500 * 1024 ,// 500KB
  logToConsole : false,
  SocketIOLogger : socketLogger
});
```
For Exporting to Server on every 10 sec us
```
function exportToServer(){
  // your other code here
  log.exportToServer();
  setTimeout(exportToServer, 10000);
};
(function(){
  exportToServer();
})()
```

 Log something you can use ( debug | info | warn | error)
 ```
log.info('something', {
  foo: 'bar'
}, 42);

// Export the log entries
const logEntries = log.exportToArray();
```
for hijacking Console.log and etc .... you can use :
```
var console=(function(oldCons){
  return {
    log: function(text){
      log.info(text);
    },
    info: function (text) {
      log.info(text);
    },
    warn: function (text) {
      log.warn(text);
    },
    error: function (text) {
      log.error(text);
    }
  };
}(window.console));

//Then redefine the old console
window.console = console;
```
**makr sure you are using logToConsole=False
if you dont want to loop your self to deth with sending youre on log in a loop ....** 
