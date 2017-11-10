"use strict";
var DefaultFormatter_1 = require('./formatters/DefaultFormatter');
var NullLogger_1 = require('./loggers/NullLogger');
var ConsoleLogger_1 = require('./loggers/ConsoleLogger');
var LocalStorageLogger_1 = require('./loggers/LocalStorageLogger');
var LogLevel_1 = require('./core/LogLevel');
/**
 * Bootstraps the log chain setup.
 */
var LogBootstrapper = (function () {
    function LogBootstrapper(_timestampProvider) {
        if (_timestampProvider === void 0) { _timestampProvider = function () { return new Date(); }; }
        this._timestampProvider = _timestampProvider;
    }
    /**
     * Returns a logging interface that has been set up with default loggers and formatters.
     */
    LogBootstrapper.prototype.bootstrap = function (config) {
        var _this = this;
        var formatter = new DefaultFormatter_1.DefaultFormatter();
        // Chain of responsibility style pattern here...
        var chainTerminal = new NullLogger_1.NullLogger();
        var consoleLogChain = new ConsoleLogger_1.ConsoleLogger(formatter, chainTerminal, config);
        var localStorageLogChain = new LocalStorageLogger_1.LocalStorageLogger(config, consoleLogChain);
        // Writes a message of a given log level to the start of the chain
        var write = function (level, args) {
            var time = _this._timestampProvider().toISOString();
            var jsonMessage = JSON.stringify(args, censor(args));
            var jsonMessageWithoutBrackets = jsonMessage.slice(1, jsonMessage.length - 1);
            localStorageLogChain.log({
                level: level, time: time, message: jsonMessageWithoutBrackets
            });
        };
        // Returns the logging interface for consumers
        return {
            debug: function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i - 0] = arguments[_i];
                }
                write(LogLevel_1.LogLevel.DEBUG, args);
            },
            info: function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i - 0] = arguments[_i];
                }
                write(LogLevel_1.LogLevel.INFO, args);
            },
            warn: function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i - 0] = arguments[_i];
                }
                write(LogLevel_1.LogLevel.WARN, args);
            },
            error: function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i - 0] = arguments[_i];
                }
                write(LogLevel_1.LogLevel.ERROR, args);
            },
            exportToArray: function () { return localStorageLogChain.allEntries().map(function (entry) { return formatter.format(entry); }); },
            exportToServer: function () {
                if (config.SocketIOLogger != null || config.SocketIOLogger.connected) {
                    var logs = localStorageLogChain.allEntriesToServer();
                    //Send up to 20 Logs each run
                    for (var i = 0; i < logs.length && i < 20; i++) {
                        config.SocketIOLogger.emit("Log", logs[i]);
                    }
                }
            },
        };
        function censor(censor) {
            var i = 0;
            return function (key, value) {
                if (i !== 0 && typeof (censor) === 'object' && typeof (value) == 'object' && censor == value)
                    return '[Circular]';
                if (i >= 29)
                    return '[Unknown]';
                ++i; // so we know we aren't using the original object anymore
                return value;
            };
        }
    };
    return LogBootstrapper;
}());
exports.LogBootstrapper = LogBootstrapper;

//# sourceMappingURL=data:application/json;charset=utf8;base64,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TUFBTSxDQUFDLGNBQWMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO29CQUNyRSxJQUFJLElBQUksR0FBRyxvQkFBb0IsQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO29CQUNyRCw2QkFBNkI7b0JBQzdCLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sSUFBSSxDQUFDLEdBQUcsRUFBRSxFQUFHLENBQUMsRUFBRSxFQUFFLENBQUM7d0JBQ2hELE1BQU0sQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDN0MsQ0FBQztnQkFDSCxDQUFDO1lBQ0gsQ0FBQztTQUVGLENBQUM7UUFDRixnQkFBaUIsTUFBTTtZQUNyQixJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDVixNQUFNLENBQUMsVUFBUyxHQUFHLEVBQUUsS0FBSztnQkFDeEIsRUFBRSxDQUFBLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxPQUFNLENBQUMsTUFBTSxDQUFDLEtBQUssUUFBUSxJQUFJLE9BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxRQUFRLElBQUksTUFBTSxJQUFJLEtBQUssQ0FBQztvQkFDeEYsTUFBTSxDQUFDLFlBQVksQ0FBQztnQkFDdEIsRUFBRSxDQUFBLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztvQkFDVCxNQUFNLENBQUMsV0FBVyxDQUFDO2dCQUNyQixFQUFFLENBQUMsQ0FBQyxDQUFDLHlEQUF5RDtnQkFDOUQsTUFBTSxDQUFDLEtBQUssQ0FBQztZQUNmLENBQUMsQ0FBQTtRQUNILENBQUM7SUFFSCxDQUFDO0lBR0gsc0JBQUM7QUFBRCxDQXREQSxBQXNEQyxJQUFBO0FBdERZLHVCQUFlLGtCQXNEM0IsQ0FBQSIsImZpbGUiOiJMb2dCb290c3RyYXBwZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0RlZmF1bHRGb3JtYXR0ZXJ9IGZyb20gJy4vZm9ybWF0dGVycy9EZWZhdWx0Rm9ybWF0dGVyJztcbmltcG9ydCB7TnVsbExvZ2dlcn0gZnJvbSAnLi9sb2dnZXJzL051bGxMb2dnZXInO1xuaW1wb3J0IHtDb25zb2xlTG9nZ2VyfSBmcm9tICcuL2xvZ2dlcnMvQ29uc29sZUxvZ2dlcic7XG5pbXBvcnQge0lMb2NhbFN0b3JhZ2VMb2dnZXJDb25maWd1cmF0aW9ufSBmcm9tICcuL2xvZ2dlcnMvSUxvY2FsU3RvcmFnZUxvZ2dlckNvbmZpZ3VyYXRpb24nO1xuaW1wb3J0IHtMb2NhbFN0b3JhZ2VMb2dnZXJ9IGZyb20gJy4vbG9nZ2Vycy9Mb2NhbFN0b3JhZ2VMb2dnZXInO1xuaW1wb3J0IHtJTG9nfSBmcm9tICcuL0lMb2cnO1xuaW1wb3J0IHtMb2dMZXZlbH0gZnJvbSAnLi9jb3JlL0xvZ0xldmVsJztcblxuXG5cbi8qKlxuICogQm9vdHN0cmFwcyB0aGUgbG9nIGNoYWluIHNldHVwLlxuICovXG5leHBvcnQgY2xhc3MgTG9nQm9vdHN0cmFwcGVyIHtcbiAgY29uc3RydWN0b3IocHJpdmF0ZSBfdGltZXN0YW1wUHJvdmlkZXI6ICgpID0+IERhdGUgPSAoKSA9PiBuZXcgRGF0ZSgpKSB7XG4gIH1cbiAgLyoqXG4gICAqIFJldHVybnMgYSBsb2dnaW5nIGludGVyZmFjZSB0aGF0IGhhcyBiZWVuIHNldCB1cCB3aXRoIGRlZmF1bHQgbG9nZ2VycyBhbmQgZm9ybWF0dGVycy5cbiAgICovXG4gIGJvb3RzdHJhcChjb25maWc6IElMb2NhbFN0b3JhZ2VMb2dnZXJDb25maWd1cmF0aW9uKSA6IElMb2cge1xuICAgIGNvbnN0IGZvcm1hdHRlciA9IG5ldyBEZWZhdWx0Rm9ybWF0dGVyKCk7XG4gICAgLy8gQ2hhaW4gb2YgcmVzcG9uc2liaWxpdHkgc3R5bGUgcGF0dGVybiBoZXJlLi4uXG4gICAgY29uc3QgY2hhaW5UZXJtaW5hbCA9IG5ldyBOdWxsTG9nZ2VyKCk7XG4gICAgY29uc3QgY29uc29sZUxvZ0NoYWluID0gbmV3IENvbnNvbGVMb2dnZXIoZm9ybWF0dGVyLCBjaGFpblRlcm1pbmFsLGNvbmZpZyk7XG4gICAgY29uc3QgbG9jYWxTdG9yYWdlTG9nQ2hhaW4gPSBuZXcgTG9jYWxTdG9yYWdlTG9nZ2VyKGNvbmZpZywgY29uc29sZUxvZ0NoYWluKTtcbiAgICAvLyBXcml0ZXMgYSBtZXNzYWdlIG9mIGEgZ2l2ZW4gbG9nIGxldmVsIHRvIHRoZSBzdGFydCBvZiB0aGUgY2hhaW5cbiAgICBjb25zdCB3cml0ZSA9IChsZXZlbCwgYXJnczogYW55W10pID0+IHtcbiAgICAgIGNvbnN0IHRpbWUgPSB0aGlzLl90aW1lc3RhbXBQcm92aWRlcigpLnRvSVNPU3RyaW5nKCk7XG4gICAgICBjb25zdCBqc29uTWVzc2FnZSA9IEpTT04uc3RyaW5naWZ5KGFyZ3MsY2Vuc29yKGFyZ3MpKTtcbiAgICAgIGNvbnN0IGpzb25NZXNzYWdlV2l0aG91dEJyYWNrZXRzID0ganNvbk1lc3NhZ2Uuc2xpY2UoMSwganNvbk1lc3NhZ2UubGVuZ3RoIC0gMSk7XG4gICAgICBsb2NhbFN0b3JhZ2VMb2dDaGFpbi5sb2coe1xuICAgICAgICBsZXZlbCwgdGltZSwgbWVzc2FnZToganNvbk1lc3NhZ2VXaXRob3V0QnJhY2tldHNcbiAgICAgIH0pO1xuICAgIH07XG4gICAgLy8gUmV0dXJucyB0aGUgbG9nZ2luZyBpbnRlcmZhY2UgZm9yIGNvbnN1bWVyc1xuICAgIHJldHVybiB7XG4gICAgICBkZWJ1ZyguLi5hcmdzKSB7IHdyaXRlKExvZ0xldmVsLkRFQlVHLCBhcmdzKTsgfSxcbiAgICAgIGluZm8oLi4uYXJncykgeyB3cml0ZShMb2dMZXZlbC5JTkZPLCBhcmdzKTsgfSxcbiAgICAgIHdhcm4oLi4uYXJncykgeyB3cml0ZShMb2dMZXZlbC5XQVJOLCBhcmdzKTsgfSxcbiAgICAgIGVycm9yKC4uLmFyZ3MpIHsgd3JpdGUoTG9nTGV2ZWwuRVJST1IsIGFyZ3MpOyB9LFxuICAgICAgZXhwb3J0VG9BcnJheSgpIHsgcmV0dXJuIGxvY2FsU3RvcmFnZUxvZ0NoYWluLmFsbEVudHJpZXMoKS5tYXAoZW50cnkgPT4gZm9ybWF0dGVyLmZvcm1hdChlbnRyeSkpOyB9LFxuICAgICAgZXhwb3J0VG9TZXJ2ZXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKGNvbmZpZy5Tb2NrZXRJT0xvZ2dlciAhPSBudWxsIHx8IGNvbmZpZy5Tb2NrZXRJT0xvZ2dlci5jb25uZWN0ZWQpIHtcbiAgICAgICAgICB2YXIgbG9ncyA9IGxvY2FsU3RvcmFnZUxvZ0NoYWluLmFsbEVudHJpZXNUb1NlcnZlcigpO1xuICAgICAgICAgIC8vU2VuZCB1cCB0byAyMCBMb2dzIGVhY2ggcnVuXG4gICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsb2dzLmxlbmd0aCAmJiBpIDwgMjAgOyBpKyspIHtcbiAgICAgICAgICAgIGNvbmZpZy5Tb2NrZXRJT0xvZ2dlci5lbWl0KFwiTG9nXCIsIGxvZ3NbaV0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSxcblxuICAgIH07XG4gICAgZnVuY3Rpb24gIGNlbnNvcihjZW5zb3IpIHtcbiAgICAgIHZhciBpID0gMDtcbiAgICAgIHJldHVybiBmdW5jdGlvbihrZXksIHZhbHVlKSB7XG4gICAgICAgIGlmKGkgIT09IDAgJiYgdHlwZW9mKGNlbnNvcikgPT09ICdvYmplY3QnICYmIHR5cGVvZih2YWx1ZSkgPT0gJ29iamVjdCcgJiYgY2Vuc29yID09IHZhbHVlKVxuICAgICAgICAgIHJldHVybiAnW0NpcmN1bGFyXSc7XG4gICAgICAgIGlmKGkgPj0gMjkpIC8vIHNlZW1zIHRvIGJlIGEgaGFyZGVkIG1heGltdW0gb2YgMzAgc2VyaWFsaXplZCBvYmplY3RzP1xuICAgICAgICAgIHJldHVybiAnW1Vua25vd25dJztcbiAgICAgICAgKytpOyAvLyBzbyB3ZSBrbm93IHdlIGFyZW4ndCB1c2luZyB0aGUgb3JpZ2luYWwgb2JqZWN0IGFueW1vcmVcbiAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgfVxuICAgIH1cblxuICB9XG5cblxufVxuXG4iXX0=
