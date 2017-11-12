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
        //   const formatter = new DefaultFormatter();
        // Chain of responsibility style pattern here...
        var chainTerminal = new NullLogger_1.NullLogger();
        var consoleLogChain = new ConsoleLogger_1.ConsoleLogger(formatter, chainTerminal, config);
        var localStorageLogChain = new LocalStorageLogger_1.LocalStorageLogger(config, consoleLogChain);
        var cleanlocalStorage = function () {
            localStorageLogChain.cleanAllEntries();
        };
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
            clean: function () { cleanlocalStorage(); },
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,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MkRDLElBQUE7QUEzRFksdUJBQWUsa0JBMkQzQixDQUFBIiwiZmlsZSI6IkxvZ0Jvb3RzdHJhcHBlci5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7RGVmYXVsdEZvcm1hdHRlcn0gZnJvbSAnLi9mb3JtYXR0ZXJzL0RlZmF1bHRGb3JtYXR0ZXInO1xuaW1wb3J0IHtOdWxsTG9nZ2VyfSBmcm9tICcuL2xvZ2dlcnMvTnVsbExvZ2dlcic7XG5pbXBvcnQge0NvbnNvbGVMb2dnZXJ9IGZyb20gJy4vbG9nZ2Vycy9Db25zb2xlTG9nZ2VyJztcbmltcG9ydCB7SUxvY2FsU3RvcmFnZUxvZ2dlckNvbmZpZ3VyYXRpb259IGZyb20gJy4vbG9nZ2Vycy9JTG9jYWxTdG9yYWdlTG9nZ2VyQ29uZmlndXJhdGlvbic7XG5pbXBvcnQge0xvY2FsU3RvcmFnZUxvZ2dlcn0gZnJvbSAnLi9sb2dnZXJzL0xvY2FsU3RvcmFnZUxvZ2dlcic7XG5pbXBvcnQge0lMb2d9IGZyb20gJy4vSUxvZyc7XG5pbXBvcnQge0xvZ0xldmVsfSBmcm9tICcuL2NvcmUvTG9nTGV2ZWwnO1xuXG5cblxuLyoqXG4gKiBCb290c3RyYXBzIHRoZSBsb2cgY2hhaW4gc2V0dXAuXG4gKi9cbmV4cG9ydCBjbGFzcyBMb2dCb290c3RyYXBwZXIge1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF90aW1lc3RhbXBQcm92aWRlcjogKCkgPT4gRGF0ZSA9ICgpID0+IG5ldyBEYXRlKCkpIHtcbiAgfVxuICAvKipcbiAgICogUmV0dXJucyBhIGxvZ2dpbmcgaW50ZXJmYWNlIHRoYXQgaGFzIGJlZW4gc2V0IHVwIHdpdGggZGVmYXVsdCBsb2dnZXJzIGFuZCBmb3JtYXR0ZXJzLlxuICAgKi9cbiAgYm9vdHN0cmFwKGNvbmZpZzogSUxvY2FsU3RvcmFnZUxvZ2dlckNvbmZpZ3VyYXRpb24pIDogSUxvZyB7XG4gICAgY29uc3QgZm9ybWF0dGVyID0gbmV3IERlZmF1bHRGb3JtYXR0ZXIgICgpO1xuICAgIC8vICAgY29uc3QgZm9ybWF0dGVyID0gbmV3IERlZmF1bHRGb3JtYXR0ZXIoKTtcbiAgICAvLyBDaGFpbiBvZiByZXNwb25zaWJpbGl0eSBzdHlsZSBwYXR0ZXJuIGhlcmUuLi5cbiAgICBjb25zdCBjaGFpblRlcm1pbmFsID0gbmV3IE51bGxMb2dnZXIoKTtcbiAgICBjb25zdCBjb25zb2xlTG9nQ2hhaW4gPSBuZXcgQ29uc29sZUxvZ2dlcihmb3JtYXR0ZXIsIGNoYWluVGVybWluYWwsY29uZmlnKTtcbiAgICBjb25zdCBsb2NhbFN0b3JhZ2VMb2dDaGFpbiA9IG5ldyBMb2NhbFN0b3JhZ2VMb2dnZXIoY29uZmlnLCBjb25zb2xlTG9nQ2hhaW4pO1xuICAgIGNvbnN0IGNsZWFubG9jYWxTdG9yYWdlID0gKCkgPT4ge1xuICAgICAgbG9jYWxTdG9yYWdlTG9nQ2hhaW4uY2xlYW5BbGxFbnRyaWVzKCk7XG4gICAgfVxuICAgICAgLy8gV3JpdGVzIGEgbWVzc2FnZSBvZiBhIGdpdmVuIGxvZyBsZXZlbCB0byB0aGUgc3RhcnQgb2YgdGhlIGNoYWluXG4gICAgY29uc3Qgd3JpdGUgPSAobGV2ZWwsIGFyZ3M6IGFueVtdKSA9PiB7XG4gICAgICBjb25zdCB0aW1lID0gdGhpcy5fdGltZXN0YW1wUHJvdmlkZXIoKS50b0lTT1N0cmluZygpO1xuICAgICAgY29uc3QganNvbk1lc3NhZ2UgPSBKU09OLnN0cmluZ2lmeShhcmdzLGNlbnNvcihhcmdzKSk7XG4gICAgICBjb25zdCBqc29uTWVzc2FnZVdpdGhvdXRCcmFja2V0cyA9IGpzb25NZXNzYWdlLnNsaWNlKDEsIGpzb25NZXNzYWdlLmxlbmd0aCAtIDEpO1xuICAgICAgbG9jYWxTdG9yYWdlTG9nQ2hhaW4ubG9nKHtcbiAgICAgICAgbGV2ZWwsIHRpbWUsIG1lc3NhZ2U6IGpzb25NZXNzYWdlV2l0aG91dEJyYWNrZXRzXG4gICAgICB9KTtcbiAgICB9O1xuICAgIC8vIFJldHVybnMgdGhlIGxvZ2dpbmcgaW50ZXJmYWNlIGZvciBjb25zdW1lcnNcbiAgICByZXR1cm4ge1xuICAgICAgZGVidWcoLi4uYXJncykgeyB3cml0ZShMb2dMZXZlbC5ERUJVRywgYXJncyk7IH0sXG4gICAgICBpbmZvKC4uLmFyZ3MpIHsgd3JpdGUoTG9nTGV2ZWwuSU5GTywgYXJncyk7IH0sXG4gICAgICB3YXJuKC4uLmFyZ3MpIHsgd3JpdGUoTG9nTGV2ZWwuV0FSTiwgYXJncyk7IH0sXG4gICAgICBlcnJvciguLi5hcmdzKSB7IHdyaXRlKExvZ0xldmVsLkVSUk9SLCBhcmdzKTsgfSxcbiAgICAgIGNsZWFuKCl7Y2xlYW5sb2NhbFN0b3JhZ2UoKX0sXG4gICAgICBleHBvcnRUb0FycmF5KCkgeyByZXR1cm4gbG9jYWxTdG9yYWdlTG9nQ2hhaW4uYWxsRW50cmllcygpLm1hcChlbnRyeSA9PiBmb3JtYXR0ZXIuZm9ybWF0KGVudHJ5KSk7IH0sXG4gICAgICBleHBvcnRUb1NlcnZlcjogZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAoY29uZmlnLlNvY2tldElPTG9nZ2VyICE9IG51bGwgfHwgY29uZmlnLlNvY2tldElPTG9nZ2VyLmNvbm5lY3RlZCkge1xuICAgICAgICAgIHZhciBsb2dzID0gbG9jYWxTdG9yYWdlTG9nQ2hhaW4uYWxsRW50cmllc1RvU2VydmVyKCk7XG4gICAgICAgICAgLy9TZW5kIHVwIHRvIDIwIExvZ3MgZWFjaCBydW5cbiAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxvZ3MubGVuZ3RoICYmIGkgPCAyMCA7IGkrKykge1xuICAgICAgICAgICAgY29uZmlnLlNvY2tldElPTG9nZ2VyLmVtaXQoXCJMb2dcIiwgbG9nc1tpXSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9LFxuXG4gICAgfTtcbiAgICBmdW5jdGlvbiAgY2Vuc29yKGNlbnNvcikge1xuICAgICAgdmFyIGkgPSAwO1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKGtleSwgdmFsdWUpIHtcbiAgICAgICAgaWYoaSAhPT0gMCAmJiB0eXBlb2YoY2Vuc29yKSA9PT0gJ29iamVjdCcgJiYgdHlwZW9mKHZhbHVlKSA9PSAnb2JqZWN0JyAmJiBjZW5zb3IgPT0gdmFsdWUpXG4gICAgICAgICAgcmV0dXJuICdbQ2lyY3VsYXJdJztcbiAgICAgICAgaWYoaSA+PSAyOSkgLy8gc2VlbXMgdG8gYmUgYSBoYXJkZWQgbWF4aW11bSBvZiAzMCBzZXJpYWxpemVkIG9iamVjdHM/XG4gICAgICAgICAgcmV0dXJuICdbVW5rbm93bl0nO1xuICAgICAgICArK2k7IC8vIHNvIHdlIGtub3cgd2UgYXJlbid0IHVzaW5nIHRoZSBvcmlnaW5hbCBvYmplY3QgYW55bW9yZVxuICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICB9XG4gICAgfVxuXG4gIH1cblxuXG59XG5cbiJdfQ==
