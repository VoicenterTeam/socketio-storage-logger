const { StorageLogger } = require("./build/StorageLogger")
const Storage = require('node-storage');

const store = new Storage('./logs.json');
function getItem(storageId) {
    return store.get(storageId)
}

function setItem(storageId, logs) {
    store.put(storageId, logs);
}

const logger = new StorageLogger({
    socketUrl: "fgdf",
    logToConsole: false,
    overloadGlobalConsole: true,
    namespace: "test",
    socketEmitInterval: 5000,
    getItem,
    setItem,
})

logger.log("hello")
logger.warn("testing blabla")
console.log('log from console')
console.error('error from console')

setTimeout(() => {
    console.warn("After timeout c")
    logger.error('after timeout')
}, 8000)