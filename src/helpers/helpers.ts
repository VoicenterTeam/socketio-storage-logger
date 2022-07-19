export function parseLog (level: string, logs: any[]) {
    const message = logs.map(log => JSON.stringify(log)).join(' ')
    const time = new Date().toISOString()
    return JSON.stringify({level, time, message})
}

export function getLogData (args: any[]) {
    const level = args[0]
    const logs = args.slice(1)
    return {level, logs}
}

export function getLogsToStore (logs: string, keysToReset: string[]) {
    const allLogs = JSON.parse(logs)
    keysToReset.forEach((key: string) => delete allLogs[key])
    return allLogs
}