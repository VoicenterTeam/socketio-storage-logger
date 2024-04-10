export function parseLogDefault (level: string, logs: any[]) {
    const message = logs.map(log => JSON.stringify(log)).join(' ')
    const time = new Date().toISOString()
    return JSON.stringify({level, time, message})
}

export function getLogData (args: any[]) {
    const level = args[0]
    const logs = args.slice(1)
    return {level, logs}
}

export function removeLogsByKeys (logs: string, keysToReset: string[]) {
    const allLogs = JSON.parse(logs)
    keysToReset.forEach((key: string) => delete allLogs[key])
    return allLogs
}

export function parseLogObject(value) {
    if (typeof value === 'object' && value !== null) {
        return value
    }

    try {
        return JSON.parse(value);
    } catch (error) {
        return { extraData: value };
    }
}

export function getOSString(userAgent) {
    const osRegex = /\(([^)]+)\)/; // Matches text within parentheses
    const match = userAgent.match(osRegex);
    if (match && match[1]) {
        const parts = match[1].split(';');
        for (let part of parts) {
            part = part.trim();
            if (part.startsWith('Windows') || part.startsWith('Macintosh') || part.startsWith('Linux')) {
                return part;
            }
        }
    }
    return 'Unknown';
}
