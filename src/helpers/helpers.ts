import { ActionNameEnum } from "../enum";
import { ActionName, ActionKey } from "../types";

export function parseLogDefault (level: string, logs: unknown[]) {
    const message = logs.map(log => JSON.stringify(log)).join(' ')
    const time = new Date().toISOString()
    return JSON.stringify({
        level,
        time,
        message
    })
}

export function getLogData (args: unknown[]) {
    const level = String(args[0])
    const logs = args.slice(1)

    return {
        level,
        logs
    }
}

export function removeLogsByKeys (logs: string, keysToReset: string[]) {
    const allLogs = JSON.parse(logs)
    keysToReset.forEach((key: string) => delete allLogs[key])
    return allLogs
}

export function parseLogObject(value: unknown) {
    if (typeof value === 'object' && value !== null) {
        return value
    }

    try {
        return JSON.parse(value as string);
    } catch (error) {
        return { extraData: value };
    }
}

export function getOSString(userAgent: string) {
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

export function promisify<T, A extends unknown[]>(func: (...args: A) => T): (...args: A) => Promise<T> {
    return (...args: A): Promise<T> => {
    return new Promise((resolve, reject) => {
        try {
            const result = func(...args);
            resolve(result);
        } catch (error) {
            reject(error);
        }
    });
};
}
