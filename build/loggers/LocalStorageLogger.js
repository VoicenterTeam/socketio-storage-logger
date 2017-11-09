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
    return LocalStorageLogger;
}());
exports.LocalStorageLogger = LocalStorageLogger;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxvZ2dlcnMvTG9jYWxTdG9yYWdlTG9nZ2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFHQSxpQ0FBK0IsMkJBQTJCLENBQUMsQ0FBQTtBQUUzRDs7O0dBR0c7QUFDSDtJQUdFOzs7O09BSUc7SUFDSCw0QkFBWSxNQUF3QyxFQUFVLFdBQW9CO1FBQXBCLGdCQUFXLEdBQVgsV0FBVyxDQUFTO1FBQ2hGLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxtQ0FBZ0IsQ0FBWTtZQUM1QyxTQUFTLEVBQUUsTUFBTSxDQUFDLE9BQU87WUFDekIsY0FBYyxFQUFFLE1BQU0sQ0FBQyxpQkFBaUI7U0FDekMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVEOztPQUVHO0lBQ0gsZ0NBQUcsR0FBSCxVQUFJLEtBQWdCO1FBQ2xCLElBQUksQ0FBQztZQUNILElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQzdCLENBQUU7UUFBQSxLQUFLLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1lBQ2YsT0FBTyxDQUFDLEtBQUssQ0FBQyxpQ0FBaUMsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUMxRCxDQUFDO2dCQUFTLENBQUM7WUFDVCxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUM5QixDQUFDO0lBQ0gsQ0FBQztJQUVEOztPQUVHO0lBQ0gsdUNBQVUsR0FBVjtRQUNFLElBQU0sT0FBTyxHQUFHLElBQUksS0FBSyxFQUFhLENBQUM7UUFDdkMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsVUFBQSxLQUFLLElBQUksT0FBQSxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFuQixDQUFtQixDQUFDLENBQUM7UUFDbEQsTUFBTSxDQUFDLE9BQU8sQ0FBQztJQUNqQixDQUFDO0lBQ0gseUJBQUM7QUFBRCxDQXBDQSxBQW9DQyxJQUFBO0FBcENZLDBCQUFrQixxQkFvQzlCLENBQUEiLCJmaWxlIjoibG9nZ2Vycy9Mb2NhbFN0b3JhZ2VMb2dnZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0lMb2dnZXJ9IGZyb20gJy4vSUxvZ2dlcic7XHJcbmltcG9ydCB7SUxvZ0VudHJ5fSBmcm9tICcuLi9jb3JlL0lMb2dFbnRyeSc7XHJcbmltcG9ydCB7SUxvY2FsU3RvcmFnZUxvZ2dlckNvbmZpZ3VyYXRpb259IGZyb20gJy4vSUxvY2FsU3RvcmFnZUxvZ2dlckNvbmZpZ3VyYXRpb24nO1xyXG5pbXBvcnQge0xpbWl0ZWRTaXplUXVldWV9IGZyb20gJy4uL3F1ZXVlL0xpbWl0ZWRTaXplUXVldWUnO1xyXG5cclxuLyoqXHJcbiAqIExvZ2dlciB0aGF0IGxvZ3MgdG8gYSBxdWV1ZSBpbiBsb2NhbCBzdG9yYWdlLiBXaWxsIG92ZXJ3cml0ZSBvbGRlc3QgZW50cmllc1xyXG4gKiB3aGVuIGRlc2lyZWQgc2l6ZSBpcyBleGNlZWRlZC5cclxuICovXHJcbmV4cG9ydCBjbGFzcyBMb2NhbFN0b3JhZ2VMb2dnZXIgaW1wbGVtZW50cyBJTG9nZ2VyIHtcclxuICBwcml2YXRlIF9xdWV1ZTogTGltaXRlZFNpemVRdWV1ZTxJTG9nRW50cnk+O1xyXG5cclxuICAvKipcclxuICAgKiBDb25zdHJ1Y3RzIGEgbmV3IGxvY2FsIHN0b3JhZ2UgbG9nZ2VyLlxyXG4gICAqIEBwYXJhbSBjb25maWcgVGhlIGNvbmZpZ3VyYXRpb24gZGVmaW5pbmcgdGhlIHVuaXF1ZSBxdWV1ZSBuYW1lLCBkZXNpcmVkIHNpemUgZXRjLlxyXG4gICAqIEBwYXJhbSBfbmV4dExvZ2dlciBUaGUgbmV4dCBsb2dnZXIgaW4gdGhlIFwibG9nIGNoYWluXCJcclxuICAgKi9cclxuICBjb25zdHJ1Y3Rvcihjb25maWc6IElMb2NhbFN0b3JhZ2VMb2dnZXJDb25maWd1cmF0aW9uLCBwcml2YXRlIF9uZXh0TG9nZ2VyOiBJTG9nZ2VyKSB7XHJcbiAgICB0aGlzLl9xdWV1ZSA9IG5ldyBMaW1pdGVkU2l6ZVF1ZXVlPElMb2dFbnRyeT4oe1xyXG4gICAgICBrZXlQcmVmaXg6IGNvbmZpZy5sb2dOYW1lLFxyXG4gICAgICBtYXhTaXplSW5CeXRlczogY29uZmlnLm1heExvZ1NpemVJbkJ5dGVzXHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIExvZ3MgYW4gZW50cnkgdG8gbG9jYWwgc3RvcmFnZS5cclxuICAgKi9cclxuICBsb2coZW50cnk6IElMb2dFbnRyeSkge1xyXG4gICAgdHJ5IHtcclxuICAgICAgdGhpcy5fcXVldWUuZW5xdWV1ZShlbnRyeSk7XHJcbiAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICBjb25zb2xlLmVycm9yKCdGYWlsZWQgdG8gbG9nIHRvIGxvY2FsIHN0b3JhZ2UuJywgZXJyb3IpO1xyXG4gICAgfSBmaW5hbGx5IHtcclxuICAgICAgdGhpcy5fbmV4dExvZ2dlci5sb2coZW50cnkpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyBhbGwgbG9nIGVudHJpZXMgdGhhdCBhcmUgc3RpbGwgaGVsZCBpbiBsb2NhbCBzdG9yYWdlLlxyXG4gICAqL1xyXG4gIGFsbEVudHJpZXMoKSA6IEFycmF5PElMb2dFbnRyeT4ge1xyXG4gICAgY29uc3QgZW50cmllcyA9IG5ldyBBcnJheTxJTG9nRW50cnk+KCk7XHJcbiAgICB0aGlzLl9xdWV1ZS5pdGVyYXRlKGVudHJ5ID0+IGVudHJpZXMucHVzaChlbnRyeSkpO1xyXG4gICAgcmV0dXJuIGVudHJpZXM7XHJcbiAgfVxyXG59XHJcbiJdfQ==
