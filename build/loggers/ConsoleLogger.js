"use strict";
/**
* Logger that logs to the console.
*/
var ConsoleLogger = (function () {
    /**
     * Constructs a console logger.
     * @param _formatter The formatter used to format the entry for the console
     * @param _nextLogger The next logger in the "log chain"
     * @param _config Config struct of the LocalStorageLoggerConfiguration
     */
    function ConsoleLogger(_formatter, _nextLogger, _config) {
        this._formatter = _formatter;
        this._nextLogger = _nextLogger;
        this._config = _config;
    }
    /**
     * Logs an entry to the console.
     * @param entry The entry to log
     */
    ConsoleLogger.prototype.log = function (entry) {
        var formattedMessage = this._formatter.format(entry);
        if (this._config.logToConsole)
            console.log(formattedMessage);
        this._nextLogger.log(entry);
    };
    return ConsoleLogger;
}());
exports.ConsoleLogger = ConsoleLogger;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxvZ2dlcnMvQ29uc29sZUxvZ2dlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBS0M7O0VBRUU7QUFDSDtJQUNFOzs7OztPQUtHO0lBQ0gsdUJBQW9CLFVBQThCLEVBQVUsV0FBb0IsRUFBVSxPQUEwQztRQUFoSCxlQUFVLEdBQVYsVUFBVSxDQUFvQjtRQUFVLGdCQUFXLEdBQVgsV0FBVyxDQUFTO1FBQVUsWUFBTyxHQUFQLE9BQU8sQ0FBbUM7SUFDcEksQ0FBQztJQUVEOzs7T0FHRztJQUNILDJCQUFHLEdBQUgsVUFBSSxLQUFnQjtRQUNsQixJQUFNLGdCQUFnQixHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3ZELEVBQUUsQ0FBQSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDO1lBQzdCLE9BQU8sQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztRQUM5QixJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUM5QixDQUFDO0lBQ0gsb0JBQUM7QUFBRCxDQXBCQSxBQW9CQyxJQUFBO0FBcEJZLHFCQUFhLGdCQW9CekIsQ0FBQSIsImZpbGUiOiJsb2dnZXJzL0NvbnNvbGVMb2dnZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0lMb2dnZXJ9IGZyb20gJy4vSUxvZ2dlcic7XG5pbXBvcnQge0lMb2dFbnRyeX0gZnJvbSAnLi4vY29yZS9JTG9nRW50cnknO1xuaW1wb3J0IHtJTG9nRW50cnlGb3JtYXR0ZXJ9IGZyb20gJy4uL2Zvcm1hdHRlcnMvSUxvZ0VudHJ5Rm9ybWF0dGVyJztcbmltcG9ydCB7SUxvY2FsU3RvcmFnZUxvZ2dlckNvbmZpZ3VyYXRpb259IGZyb20gJy4vSUxvY2FsU3RvcmFnZUxvZ2dlckNvbmZpZ3VyYXRpb24nO1xuXG4gLyoqXG4gKiBMb2dnZXIgdGhhdCBsb2dzIHRvIHRoZSBjb25zb2xlLlxuICovXG5leHBvcnQgY2xhc3MgQ29uc29sZUxvZ2dlciBpbXBsZW1lbnRzIElMb2dnZXIge1xuICAvKipcbiAgICogQ29uc3RydWN0cyBhIGNvbnNvbGUgbG9nZ2VyLlxuICAgKiBAcGFyYW0gX2Zvcm1hdHRlciBUaGUgZm9ybWF0dGVyIHVzZWQgdG8gZm9ybWF0IHRoZSBlbnRyeSBmb3IgdGhlIGNvbnNvbGVcbiAgICogQHBhcmFtIF9uZXh0TG9nZ2VyIFRoZSBuZXh0IGxvZ2dlciBpbiB0aGUgXCJsb2cgY2hhaW5cIlxuICAgKiBAcGFyYW0gX2NvbmZpZyBDb25maWcgc3RydWN0IG9mIHRoZSBMb2NhbFN0b3JhZ2VMb2dnZXJDb25maWd1cmF0aW9uXG4gICAqL1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF9mb3JtYXR0ZXI6IElMb2dFbnRyeUZvcm1hdHRlciwgcHJpdmF0ZSBfbmV4dExvZ2dlcjogSUxvZ2dlciwgcHJpdmF0ZSBfY29uZmlnIDogSUxvY2FsU3RvcmFnZUxvZ2dlckNvbmZpZ3VyYXRpb24gKSB7XG4gIH1cblxuICAvKipcbiAgICogTG9ncyBhbiBlbnRyeSB0byB0aGUgY29uc29sZS5cbiAgICogQHBhcmFtIGVudHJ5IFRoZSBlbnRyeSB0byBsb2dcbiAgICovXG4gIGxvZyhlbnRyeTogSUxvZ0VudHJ5KSB7XG4gICAgY29uc3QgZm9ybWF0dGVkTWVzc2FnZSA9IHRoaXMuX2Zvcm1hdHRlci5mb3JtYXQoZW50cnkpO1xuICAgIGlmKHRoaXMuX2NvbmZpZy5sb2dUb0NvbnNvbGUpXG4gICAgY29uc29sZS5sb2coZm9ybWF0dGVkTWVzc2FnZSk7XG4gICAgdGhpcy5fbmV4dExvZ2dlci5sb2coZW50cnkpO1xuICB9XG59XG4iXX0=
