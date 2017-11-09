import {ILogger} from './ILogger';
import {ILogEntry} from '../core/ILogEntry';
import {ILogEntryFormatter} from '../formatters/ILogEntryFormatter';
import {ILocalStorageLoggerConfiguration} from './ILocalStorageLoggerConfiguration';

 /**
 * Logger that logs to the console.
 */
export class ConsoleLogger implements ILogger {
  /**
   * Constructs a console logger.
   * @param _formatter The formatter used to format the entry for the console
   * @param _nextLogger The next logger in the "log chain"
   * @param _config Config struct of the LocalStorageLoggerConfiguration
   */
  constructor(private _formatter: ILogEntryFormatter, private _nextLogger: ILogger, private _config : ILocalStorageLoggerConfiguration ) {
  }

  /**
   * Logs an entry to the console.
   * @param entry The entry to log
   */
  log(entry: ILogEntry) {
    const formattedMessage = this._formatter.format(entry);
    if(this._config.logToConsole)
    console.log(formattedMessage);
    this._nextLogger.log(entry);
  }
}
