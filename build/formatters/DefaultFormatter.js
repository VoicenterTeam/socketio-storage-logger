"use strict";
var LogLevel_1 = require('../core/LogLevel');
/**
 * Provides the default formatting for a log entry. E.g., "[2015-01-12 00:01:08] [INFO] Message blah blah..."
 */
var DefaultFormatter = (function () {
    function DefaultFormatter() {
    }
    /**
     * Formats a log entry as [TIME] [LEVEL] MESSAGE
     * @param entry The log entry
     */
    DefaultFormatter.prototype.format = function (entry) {
        return "[" + entry.time + "] [" + LogLevel_1.LogLevel[entry.level] + "] " + entry.message;
    };
    return DefaultFormatter;
}());
exports.DefaultFormatter = DefaultFormatter;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZvcm1hdHRlcnMvRGVmYXVsdEZvcm1hdHRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEseUJBQXVCLGtCQUFrQixDQUFDLENBQUE7QUFJMUM7O0dBRUc7QUFDSDtJQUFBO0lBUUEsQ0FBQztJQVBDOzs7T0FHRztJQUNILGlDQUFNLEdBQU4sVUFBTyxLQUFnQjtRQUNyQixNQUFNLENBQUMsTUFBSSxLQUFLLENBQUMsSUFBSSxXQUFNLG1CQUFRLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxVQUFLLEtBQUssQ0FBQyxPQUFTLENBQUM7SUFDdkUsQ0FBQztJQUNILHVCQUFDO0FBQUQsQ0FSQSxBQVFDLElBQUE7QUFSWSx3QkFBZ0IsbUJBUTVCLENBQUEiLCJmaWxlIjoiZm9ybWF0dGVycy9EZWZhdWx0Rm9ybWF0dGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtMb2dMZXZlbH0gZnJvbSAnLi4vY29yZS9Mb2dMZXZlbCc7XHJcbmltcG9ydCB7SUxvZ0VudHJ5fSBmcm9tICcuLi9jb3JlL0lMb2dFbnRyeSc7XHJcbmltcG9ydCB7SUxvZ0VudHJ5Rm9ybWF0dGVyfSBmcm9tICcuL0lMb2dFbnRyeUZvcm1hdHRlcic7XHJcblxyXG4vKipcclxuICogUHJvdmlkZXMgdGhlIGRlZmF1bHQgZm9ybWF0dGluZyBmb3IgYSBsb2cgZW50cnkuIEUuZy4sIFwiWzIwMTUtMDEtMTIgMDA6MDE6MDhdIFtJTkZPXSBNZXNzYWdlIGJsYWggYmxhaC4uLlwiXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgRGVmYXVsdEZvcm1hdHRlciBpbXBsZW1lbnRzIElMb2dFbnRyeUZvcm1hdHRlciB7XHJcbiAgLyoqXHJcbiAgICogRm9ybWF0cyBhIGxvZyBlbnRyeSBhcyBbVElNRV0gW0xFVkVMXSBNRVNTQUdFXHJcbiAgICogQHBhcmFtIGVudHJ5IFRoZSBsb2cgZW50cnlcclxuICAgKi9cclxuICBmb3JtYXQoZW50cnk6IElMb2dFbnRyeSkgOiBzdHJpbmd7XHJcbiAgICByZXR1cm4gYFske2VudHJ5LnRpbWV9XSBbJHtMb2dMZXZlbFtlbnRyeS5sZXZlbF19XSAke2VudHJ5Lm1lc3NhZ2V9YDtcclxuICB9XHJcbn1cclxuIl19
