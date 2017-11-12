import {DefaultFormatter} from './formatters/DefaultFormatter';
import {NullLogger} from './loggers/NullLogger';
import {ConsoleLogger} from './loggers/ConsoleLogger';
import {ILocalStorageLoggerConfiguration} from './loggers/ILocalStorageLoggerConfiguration';
import {LocalStorageLogger} from './loggers/LocalStorageLogger';
import {ILog} from './ILog';
import {LogLevel} from './core/LogLevel';



/**
 * Bootstraps the log chain setup.
 */
export class LogBootstrapper {
  constructor(private _timestampProvider: () => Date = () => new Date()) {
  }
  /**
   * Returns a logging interface that has been set up with default loggers and formatters.
   */
  bootstrap(config: ILocalStorageLoggerConfiguration) : ILog {
    const formatter = new DefaultFormatter  ();
    //   const formatter = new DefaultFormatter();
    // Chain of responsibility style pattern here...
    const chainTerminal = new NullLogger();
    const consoleLogChain = new ConsoleLogger(formatter, chainTerminal,config);
    const localStorageLogChain = new LocalStorageLogger(config, consoleLogChain);
    const cleanlocalStorage = () => {
      localStorageLogChain.cleanAllEntries();
    }
      // Writes a message of a given log level to the start of the chain
    const write = (level, args: any[]) => {
      const time = this._timestampProvider().toISOString();
      const jsonMessage = JSON.stringify(args,censor(args));
      const jsonMessageWithoutBrackets = jsonMessage.slice(1, jsonMessage.length - 1);
      localStorageLogChain.log({
        level, time, message: jsonMessageWithoutBrackets
      });
    };
    // Returns the logging interface for consumers
    return {
      debug(...args) { write(LogLevel.DEBUG, args); },
      info(...args) { write(LogLevel.INFO, args); },
      warn(...args) { write(LogLevel.WARN, args); },
      error(...args) { write(LogLevel.ERROR, args); },
      clean(){cleanlocalStorage()},
      exportToArray() { return localStorageLogChain.allEntries().map(entry => formatter.format(entry)); },
      exportToServer: function () {
        if (config.SocketIOLogger != null || config.SocketIOLogger.connected) {
          var logs = localStorageLogChain.allEntriesToServer();
          //Send up to 20 Logs each run
          for (var i = 0; i < logs.length && i < 20 ; i++) {
            config.SocketIOLogger.emit("Log", logs[i]);
          }
        }
      },

    };
    function  censor(censor) {
      var i = 0;
      return function(key, value) {
        if(i !== 0 && typeof(censor) === 'object' && typeof(value) == 'object' && censor == value)
          return '[Circular]';
        if(i >= 29) // seems to be a harded maximum of 30 serialized objects?
          return '[Unknown]';
        ++i; // so we know we aren't using the original object anymore
        return value;
      }
    }

  }


}

