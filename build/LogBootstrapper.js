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
            var jsonMessage = JSON.stringify(args);
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
            exportToArray: function () { return localStorageLogChain.allEntries().map(function (entry) { return formatter.format(entry); }); }
        };
    };
    return LogBootstrapper;
}());
exports.LogBootstrapper = LogBootstrapper;

//# sourceMappingURL=data:application/json;charset=utf8;base64,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b290c3RyYXBwZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0RlZmF1bHRGb3JtYXR0ZXJ9IGZyb20gJy4vZm9ybWF0dGVycy9EZWZhdWx0Rm9ybWF0dGVyJztcbmltcG9ydCB7TnVsbExvZ2dlcn0gZnJvbSAnLi9sb2dnZXJzL051bGxMb2dnZXInO1xuaW1wb3J0IHtDb25zb2xlTG9nZ2VyfSBmcm9tICcuL2xvZ2dlcnMvQ29uc29sZUxvZ2dlcic7XG5pbXBvcnQge0lMb2NhbFN0b3JhZ2VMb2dnZXJDb25maWd1cmF0aW9ufSBmcm9tICcuL2xvZ2dlcnMvSUxvY2FsU3RvcmFnZUxvZ2dlckNvbmZpZ3VyYXRpb24nO1xuaW1wb3J0IHtMb2NhbFN0b3JhZ2VMb2dnZXJ9IGZyb20gJy4vbG9nZ2Vycy9Mb2NhbFN0b3JhZ2VMb2dnZXInO1xuaW1wb3J0IHtJTG9nfSBmcm9tICcuL0lMb2cnO1xuaW1wb3J0IHtMb2dMZXZlbH0gZnJvbSAnLi9jb3JlL0xvZ0xldmVsJztcblxuLyoqXG4gKiBCb290c3RyYXBzIHRoZSBsb2cgY2hhaW4gc2V0dXAuXG4gKi9cbmV4cG9ydCBjbGFzcyBMb2dCb290c3RyYXBwZXIge1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF90aW1lc3RhbXBQcm92aWRlcjogKCkgPT4gRGF0ZSA9ICgpID0+IG5ldyBEYXRlKCkpIHtcbiAgfVxuICAvKipcbiAgICogUmV0dXJucyBhIGxvZ2dpbmcgaW50ZXJmYWNlIHRoYXQgaGFzIGJlZW4gc2V0IHVwIHdpdGggZGVmYXVsdCBsb2dnZXJzIGFuZCBmb3JtYXR0ZXJzLlxuICAgKi9cbiAgYm9vdHN0cmFwKGNvbmZpZzogSUxvY2FsU3RvcmFnZUxvZ2dlckNvbmZpZ3VyYXRpb24pIDogSUxvZyB7XG4gICAgY29uc3QgZm9ybWF0dGVyID0gbmV3IERlZmF1bHRGb3JtYXR0ZXIoKTtcbiAgICAvLyBDaGFpbiBvZiByZXNwb25zaWJpbGl0eSBzdHlsZSBwYXR0ZXJuIGhlcmUuLi5cbiAgICBjb25zdCBjaGFpblRlcm1pbmFsID0gbmV3IE51bGxMb2dnZXIoKTtcbiAgICBjb25zdCBjb25zb2xlTG9nQ2hhaW4gPSBuZXcgQ29uc29sZUxvZ2dlcihmb3JtYXR0ZXIsIGNoYWluVGVybWluYWwsY29uZmlnKTtcbiAgICBjb25zdCBsb2NhbFN0b3JhZ2VMb2dDaGFpbiA9IG5ldyBMb2NhbFN0b3JhZ2VMb2dnZXIoY29uZmlnLCBjb25zb2xlTG9nQ2hhaW4pO1xuICAgIC8vIFdyaXRlcyBhIG1lc3NhZ2Ugb2YgYSBnaXZlbiBsb2cgbGV2ZWwgdG8gdGhlIHN0YXJ0IG9mIHRoZSBjaGFpblxuICAgIGNvbnN0IHdyaXRlID0gKGxldmVsLCBhcmdzOiBhbnlbXSkgPT4ge1xuICAgICAgY29uc3QgdGltZSA9IHRoaXMuX3RpbWVzdGFtcFByb3ZpZGVyKCkudG9JU09TdHJpbmcoKTtcbiAgICAgIGNvbnN0IGpzb25NZXNzYWdlID0gSlNPTi5zdHJpbmdpZnkoYXJncyk7XG4gICAgICBjb25zdCBqc29uTWVzc2FnZVdpdGhvdXRCcmFja2V0cyA9IGpzb25NZXNzYWdlLnNsaWNlKDEsIGpzb25NZXNzYWdlLmxlbmd0aCAtIDEpO1xuICAgICAgbG9jYWxTdG9yYWdlTG9nQ2hhaW4ubG9nKHtcbiAgICAgICAgbGV2ZWwsIHRpbWUsIG1lc3NhZ2U6IGpzb25NZXNzYWdlV2l0aG91dEJyYWNrZXRzXG4gICAgICB9KTtcbiAgICB9O1xuICAgIC8vIFJldHVybnMgdGhlIGxvZ2dpbmcgaW50ZXJmYWNlIGZvciBjb25zdW1lcnNcbiAgICByZXR1cm4ge1xuICAgICAgZGVidWcoLi4uYXJncykgeyB3cml0ZShMb2dMZXZlbC5ERUJVRywgYXJncyk7IH0sXG4gICAgICBpbmZvKC4uLmFyZ3MpIHsgd3JpdGUoTG9nTGV2ZWwuSU5GTywgYXJncyk7IH0sXG4gICAgICB3YXJuKC4uLmFyZ3MpIHsgd3JpdGUoTG9nTGV2ZWwuV0FSTiwgYXJncyk7IH0sXG4gICAgICBlcnJvciguLi5hcmdzKSB7IHdyaXRlKExvZ0xldmVsLkVSUk9SLCBhcmdzKTsgfSxcbiAgICAgIGV4cG9ydFRvQXJyYXkoKSB7IHJldHVybiBsb2NhbFN0b3JhZ2VMb2dDaGFpbi5hbGxFbnRyaWVzKCkubWFwKGVudHJ5ID0+IGZvcm1hdHRlci5mb3JtYXQoZW50cnkpKTsgfVxuICAgIH07XG4gIH1cbn1cblxuIl19
