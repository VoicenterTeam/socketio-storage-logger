"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeLogsByKeys = exports.getLogData = exports.parseLogDefault = void 0;
function parseLogDefault(level, logs) {
    const message = logs.map(log => JSON.stringify(log)).join(' ');
    const time = new Date().toISOString();
    return JSON.stringify({ level, time, message });
}
exports.parseLogDefault = parseLogDefault;
function getLogData(args) {
    const level = args[0];
    const logs = args.slice(1);
    return { level, logs };
}
exports.getLogData = getLogData;
function removeLogsByKeys(logs, keysToReset) {
    const allLogs = JSON.parse(logs);
    keysToReset.forEach((key) => delete allLogs[key]);
    return allLogs;
}
exports.removeLogsByKeys = removeLogsByKeys;
