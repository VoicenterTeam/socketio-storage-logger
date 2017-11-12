import {LogLevel} from '../core/LogLevel';
import {ILogEntry} from '../core/ILogEntry';
import {ILogEntryFormatter} from './ILogEntryFormatter';
import JSON = Mocha.reporters.JSON;

/**
 * Provides the default formatting for a log entry. E.g., "[2015-01-12 00:01:08] [INFO] Message blah blah..."
 */
export class DefaultFormatter implements ILogEntryFormatter {
  /**
   * Formats a log entry as [TIME] [LEVEL] MESSAGE
   * @param entry The log entry
   */
  format(entry: ILogEntry) : string{
    return `[${entry.time}] [${LogLevel[entry.level]}] ${entry.message}`;
  }
}/**
 * Provides the default formatting for a log entry. E.g., "[2015-01-12 00:01:08] [INFO] Message blah blah..."
 */
export class JSONFormatter implements ILogEntryFormatter {
  /**
   * Formats a log entry as [TIME] [LEVEL] MESSAGE
   * @param entry The log entry
   */
  format(entry: ILogEntry) : string{
    return `{t:'${entry.time}',l:'${LogLevel[entry.level]}',m:'${entry.message}'}`;
    //  return json.stringify(entry);
   // return JSON. stringify(entry);
  }
}
