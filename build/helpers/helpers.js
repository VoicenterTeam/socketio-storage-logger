"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLogsToStore = exports.getLogData = exports.parseLog = void 0;
function parseLog(level, logs) {
    const message = logs.map(log => JSON.stringify(log)).join(' ');
    const time = new Date().toISOString();
    return JSON.stringify({ level, time, message });
}
exports.parseLog = parseLog;
function getLogData(args) {
    const level = args[0];
    const logs = args.slice(1);
    return { level, logs };
}
exports.getLogData = getLogData;
function getLogsToStore(logs, keysToReset) {
    const allLogs = JSON.parse(logs);
    keysToReset.forEach((key) => delete allLogs[key]);
    return allLogs;
}
exports.getLogsToStore = getLogsToStore;
