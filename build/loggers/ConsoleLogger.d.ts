import { ILogger } from './ILogger';
import { ILogEntry } from '../core/ILogEntry';
import { ILogEntryFormatter } from '../formatters/ILogEntryFormatter';
import { ILocalStorageLoggerConfiguration } from './ILocalStorageLoggerConfiguration';
/**
* Logger that logs to the console.
*/
export declare class ConsoleLogger implements ILogger {
    private _formatter;
    private _nextLogger;
    private _config;
    /**
     * Constructs a console logger.
     * @param _formatter The formatter used to format the entry for the console
     * @param _nextLogger The next logger in the "log chain"
     * @param _config Config struct of the LocalStorageLoggerConfiguration
     */
    constructor(_formatter: ILogEntryFormatter, _nextLogger: ILogger, _config: ILocalStorageLoggerConfiguration);
    /**
     * Logs an entry to the console.
     * @param entry The entry to log
     */
    log(entry: ILogEntry): void;
}
