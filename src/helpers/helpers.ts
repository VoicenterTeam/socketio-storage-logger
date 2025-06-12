export function removeLogsByKeys (logs: string, keysToReset: string[]) {
    const allLogs = JSON.parse(logs)
    keysToReset.forEach((key: string) => delete allLogs[key])
    return allLogs
}

export function parseLogObject (value: unknown) {
    if (typeof value === 'object' && value !== null) {
        return value
    }

    try {
        return JSON.parse(value as string)
    } catch (error) {
        return { extraData: value }
    }
}

export function getOSString (userAgent: string) {
    const osRegex = /\(([^)]+)\)/ // Matches text within parentheses
    const match = userAgent.match(osRegex)
    if (match && match[1]) {
        const parts = match[1].split(';')
        for (let part of parts) {
            part = part.trim()
            if (part.startsWith('Windows') || part.startsWith('Macintosh') || part.startsWith('Linux')) {
                return part
            }
        }
    }
    return 'Unknown'
}
