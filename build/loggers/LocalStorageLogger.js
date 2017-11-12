"use strict";
var LimitedSizeQueue_1 = require('../queue/LimitedSizeQueue');
/**
 * Logger that logs to a queue in local storage. Will overwrite oldest entries
 * when desired size is exceeded.
 */
var LocalStorageLogger = (function () {
    /**
     * Constructs a new local storage logger.
     * @param config The configuration defining the unique queue name, desired size etc.
     * @param _nextLogger The next logger in the "log chain"
     */
    function LocalStorageLogger(config, _nextLogger) {
        this._nextLogger = _nextLogger;
        this._queue = new LimitedSizeQueue_1.LimitedSizeQueue({
            keyPrefix: config.logName,
            maxSizeInBytes: config.maxLogSizeInBytes
        });
    }
    /**
     * Logs an entry to local storage.
     */
    LocalStorageLogger.prototype.log = function (entry) {
        try {
            this._queue.enqueue(entry);
        }
        catch (error) {
            console.error('Failed to log to local storage.', error);
        }
        finally {
            this._nextLogger.log(entry);
        }
    };
    /**
     * Returns all log entries that are still held in local storage.
     */
    LocalStorageLogger.prototype.allEntries = function () {
        var entries = new Array();
        this._queue.iterate(function (entry) { return entries.push(entry); });
        return entries;
    };
    /**
     * Returns all log entries that are still held in local storage.
     */
    LocalStorageLogger.prototype.cleanAllEntries = function () {
        this._queue.cleanAll();
    };
    /**
     * Returns all log entries that are still held in local storage.
     */
    LocalStorageLogger.prototype.allEntriesToServer = function () {
        var entries = new Array();
        this._queue.iterateForServer(function (entry) { return entries.push(entry); });
        return entries;
    };
    return LocalStorageLogger;
}());
exports.LocalStorageLogger = LocalStorageLogger;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxvZ2dlcnMvTG9jYWxTdG9yYWdlTG9nZ2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFHQSxpQ0FBK0IsMkJBQTJCLENBQUMsQ0FBQTtBQUUzRDs7O0dBR0c7QUFDSDtJQUdFOzs7O09BSUc7SUFDSCw0QkFBWSxNQUF3QyxFQUFVLFdBQW9CO1FBQXBCLGdCQUFXLEdBQVgsV0FBVyxDQUFTO1FBQ2hGLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxtQ0FBZ0IsQ0FBWTtZQUM1QyxTQUFTLEVBQUUsTUFBTSxDQUFDLE9BQU87WUFDekIsY0FBYyxFQUFFLE1BQU0sQ0FBQyxpQkFBaUI7U0FDekMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVEOztPQUVHO0lBQ0gsZ0NBQUcsR0FBSCxVQUFJLEtBQWdCO1FBQ2xCLElBQUksQ0FBQztZQUNILElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQzdCLENBQUU7UUFBQSxLQUFLLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1lBQ2YsT0FBTyxDQUFDLEtBQUssQ0FBQyxpQ0FBaUMsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUMxRCxDQUFDO2dCQUFTLENBQUM7WUFDVCxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUM5QixDQUFDO0lBQ0gsQ0FBQztJQUVEOztPQUVHO0lBQ0gsdUNBQVUsR0FBVjtRQUNFLElBQU0sT0FBTyxHQUFHLElBQUksS0FBSyxFQUFhLENBQUM7UUFDdkMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsVUFBQSxLQUFLLElBQUksT0FBQSxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFuQixDQUFtQixDQUFDLENBQUM7UUFDbEQsTUFBTSxDQUFDLE9BQU8sQ0FBQztJQUNqQixDQUFDO0lBQ0Q7O09BRUc7SUFDSCw0Q0FBZSxHQUFmO1FBQ0UsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUN6QixDQUFDO0lBQ0Q7O09BRUc7SUFDSCwrQ0FBa0IsR0FBbEI7UUFDRSxJQUFNLE9BQU8sR0FBRyxJQUFJLEtBQUssRUFBYSxDQUFDO1FBQ3ZDLElBQUksQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsVUFBQSxLQUFLLElBQUksT0FBQSxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFuQixDQUFtQixDQUFDLENBQUM7UUFDM0QsTUFBTSxDQUFDLE9BQU8sQ0FBQztJQUNqQixDQUFDO0lBQ0gseUJBQUM7QUFBRCxDQWxEQSxBQWtEQyxJQUFBO0FBbERZLDBCQUFrQixxQkFrRDlCLENBQUEiLCJmaWxlIjoibG9nZ2Vycy9Mb2NhbFN0b3JhZ2VMb2dnZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0lMb2dnZXJ9IGZyb20gJy4vSUxvZ2dlcic7XG5pbXBvcnQge0lMb2dFbnRyeX0gZnJvbSAnLi4vY29yZS9JTG9nRW50cnknO1xuaW1wb3J0IHtJTG9jYWxTdG9yYWdlTG9nZ2VyQ29uZmlndXJhdGlvbn0gZnJvbSAnLi9JTG9jYWxTdG9yYWdlTG9nZ2VyQ29uZmlndXJhdGlvbic7XG5pbXBvcnQge0xpbWl0ZWRTaXplUXVldWV9IGZyb20gJy4uL3F1ZXVlL0xpbWl0ZWRTaXplUXVldWUnO1xuXG4vKipcbiAqIExvZ2dlciB0aGF0IGxvZ3MgdG8gYSBxdWV1ZSBpbiBsb2NhbCBzdG9yYWdlLiBXaWxsIG92ZXJ3cml0ZSBvbGRlc3QgZW50cmllc1xuICogd2hlbiBkZXNpcmVkIHNpemUgaXMgZXhjZWVkZWQuXG4gKi9cbmV4cG9ydCBjbGFzcyBMb2NhbFN0b3JhZ2VMb2dnZXIgaW1wbGVtZW50cyBJTG9nZ2VyIHtcbiAgcHJpdmF0ZSBfcXVldWU6IExpbWl0ZWRTaXplUXVldWU8SUxvZ0VudHJ5PjtcblxuICAvKipcbiAgICogQ29uc3RydWN0cyBhIG5ldyBsb2NhbCBzdG9yYWdlIGxvZ2dlci5cbiAgICogQHBhcmFtIGNvbmZpZyBUaGUgY29uZmlndXJhdGlvbiBkZWZpbmluZyB0aGUgdW5pcXVlIHF1ZXVlIG5hbWUsIGRlc2lyZWQgc2l6ZSBldGMuXG4gICAqIEBwYXJhbSBfbmV4dExvZ2dlciBUaGUgbmV4dCBsb2dnZXIgaW4gdGhlIFwibG9nIGNoYWluXCJcbiAgICovXG4gIGNvbnN0cnVjdG9yKGNvbmZpZzogSUxvY2FsU3RvcmFnZUxvZ2dlckNvbmZpZ3VyYXRpb24sIHByaXZhdGUgX25leHRMb2dnZXI6IElMb2dnZXIpIHtcbiAgICB0aGlzLl9xdWV1ZSA9IG5ldyBMaW1pdGVkU2l6ZVF1ZXVlPElMb2dFbnRyeT4oe1xuICAgICAga2V5UHJlZml4OiBjb25maWcubG9nTmFtZSxcbiAgICAgIG1heFNpemVJbkJ5dGVzOiBjb25maWcubWF4TG9nU2l6ZUluQnl0ZXNcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBMb2dzIGFuIGVudHJ5IHRvIGxvY2FsIHN0b3JhZ2UuXG4gICAqL1xuICBsb2coZW50cnk6IElMb2dFbnRyeSkge1xuICAgIHRyeSB7XG4gICAgICB0aGlzLl9xdWV1ZS5lbnF1ZXVlKGVudHJ5KTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgY29uc29sZS5lcnJvcignRmFpbGVkIHRvIGxvZyB0byBsb2NhbCBzdG9yYWdlLicsIGVycm9yKTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgdGhpcy5fbmV4dExvZ2dlci5sb2coZW50cnkpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGFsbCBsb2cgZW50cmllcyB0aGF0IGFyZSBzdGlsbCBoZWxkIGluIGxvY2FsIHN0b3JhZ2UuXG4gICAqL1xuICBhbGxFbnRyaWVzKCkgOiBBcnJheTxJTG9nRW50cnk+IHtcbiAgICBjb25zdCBlbnRyaWVzID0gbmV3IEFycmF5PElMb2dFbnRyeT4oKTtcbiAgICB0aGlzLl9xdWV1ZS5pdGVyYXRlKGVudHJ5ID0+IGVudHJpZXMucHVzaChlbnRyeSkpO1xuICAgIHJldHVybiBlbnRyaWVzO1xuICB9XG4gIC8qKlxuICAgKiBSZXR1cm5zIGFsbCBsb2cgZW50cmllcyB0aGF0IGFyZSBzdGlsbCBoZWxkIGluIGxvY2FsIHN0b3JhZ2UuXG4gICAqL1xuICBjbGVhbkFsbEVudHJpZXMoKSA6IHZvaWQgIHtcbiAgICB0aGlzLl9xdWV1ZS5jbGVhbkFsbCgpO1xuICB9XG4gIC8qKlxuICAgKiBSZXR1cm5zIGFsbCBsb2cgZW50cmllcyB0aGF0IGFyZSBzdGlsbCBoZWxkIGluIGxvY2FsIHN0b3JhZ2UuXG4gICAqL1xuICBhbGxFbnRyaWVzVG9TZXJ2ZXIoKSA6IEFycmF5PElMb2dFbnRyeT4ge1xuICAgIGNvbnN0IGVudHJpZXMgPSBuZXcgQXJyYXk8SUxvZ0VudHJ5PigpO1xuICAgIHRoaXMuX3F1ZXVlLml0ZXJhdGVGb3JTZXJ2ZXIoZW50cnkgPT4gZW50cmllcy5wdXNoKGVudHJ5KSk7XG4gICAgcmV0dXJuIGVudHJpZXM7XG4gIH1cbn1cbiJdfQ==
