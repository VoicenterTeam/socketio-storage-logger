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
exports.DefaultFormatter = DefaultFormatter; /**
 * Provides the default formatting for a log entry. E.g., "[2015-01-12 00:01:08] [INFO] Message blah blah..."
 */
var JSONFormatter = (function () {
    function JSONFormatter() {
    }
    /**
     * Formats a log entry as [TIME] [LEVEL] MESSAGE
     * @param entry The log entry
     */
    JSONFormatter.prototype.format = function (entry) {
        return "{t:'" + entry.time + "',l:'" + LogLevel_1.LogLevel[entry.level] + "',m:'" + entry.message + "'}";
        //  return json.stringify(entry);
        // return JSON. stringify(entry);
    };
    return JSONFormatter;
}());
exports.JSONFormatter = JSONFormatter;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZvcm1hdHRlcnMvRGVmYXVsdEZvcm1hdHRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEseUJBQXVCLGtCQUFrQixDQUFDLENBQUE7QUFLMUM7O0dBRUc7QUFDSDtJQUFBO0lBUUEsQ0FBQztJQVBDOzs7T0FHRztJQUNILGlDQUFNLEdBQU4sVUFBTyxLQUFnQjtRQUNyQixNQUFNLENBQUMsTUFBSSxLQUFLLENBQUMsSUFBSSxXQUFNLG1CQUFRLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxVQUFLLEtBQUssQ0FBQyxPQUFTLENBQUM7SUFDdkUsQ0FBQztJQUNILHVCQUFDO0FBQUQsQ0FSQSxBQVFDLElBQUE7QUFSWSx3QkFBZ0IsbUJBUTVCLENBQUEsQ0FBQTs7R0FFRTtBQUNIO0lBQUE7SUFVQSxDQUFDO0lBVEM7OztPQUdHO0lBQ0gsOEJBQU0sR0FBTixVQUFPLEtBQWdCO1FBQ3JCLE1BQU0sQ0FBQyxTQUFPLEtBQUssQ0FBQyxJQUFJLGFBQVEsbUJBQVEsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLGFBQVEsS0FBSyxDQUFDLE9BQU8sT0FBSSxDQUFDO1FBQy9FLGlDQUFpQztRQUNsQyxpQ0FBaUM7SUFDbEMsQ0FBQztJQUNILG9CQUFDO0FBQUQsQ0FWQSxBQVVDLElBQUE7QUFWWSxxQkFBYSxnQkFVekIsQ0FBQSIsImZpbGUiOiJmb3JtYXR0ZXJzL0RlZmF1bHRGb3JtYXR0ZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0xvZ0xldmVsfSBmcm9tICcuLi9jb3JlL0xvZ0xldmVsJztcbmltcG9ydCB7SUxvZ0VudHJ5fSBmcm9tICcuLi9jb3JlL0lMb2dFbnRyeSc7XG5pbXBvcnQge0lMb2dFbnRyeUZvcm1hdHRlcn0gZnJvbSAnLi9JTG9nRW50cnlGb3JtYXR0ZXInO1xuaW1wb3J0IEpTT04gPSBNb2NoYS5yZXBvcnRlcnMuSlNPTjtcblxuLyoqXG4gKiBQcm92aWRlcyB0aGUgZGVmYXVsdCBmb3JtYXR0aW5nIGZvciBhIGxvZyBlbnRyeS4gRS5nLiwgXCJbMjAxNS0wMS0xMiAwMDowMTowOF0gW0lORk9dIE1lc3NhZ2UgYmxhaCBibGFoLi4uXCJcbiAqL1xuZXhwb3J0IGNsYXNzIERlZmF1bHRGb3JtYXR0ZXIgaW1wbGVtZW50cyBJTG9nRW50cnlGb3JtYXR0ZXIge1xuICAvKipcbiAgICogRm9ybWF0cyBhIGxvZyBlbnRyeSBhcyBbVElNRV0gW0xFVkVMXSBNRVNTQUdFXG4gICAqIEBwYXJhbSBlbnRyeSBUaGUgbG9nIGVudHJ5XG4gICAqL1xuICBmb3JtYXQoZW50cnk6IElMb2dFbnRyeSkgOiBzdHJpbmd7XG4gICAgcmV0dXJuIGBbJHtlbnRyeS50aW1lfV0gWyR7TG9nTGV2ZWxbZW50cnkubGV2ZWxdfV0gJHtlbnRyeS5tZXNzYWdlfWA7XG4gIH1cbn0vKipcbiAqIFByb3ZpZGVzIHRoZSBkZWZhdWx0IGZvcm1hdHRpbmcgZm9yIGEgbG9nIGVudHJ5LiBFLmcuLCBcIlsyMDE1LTAxLTEyIDAwOjAxOjA4XSBbSU5GT10gTWVzc2FnZSBibGFoIGJsYWguLi5cIlxuICovXG5leHBvcnQgY2xhc3MgSlNPTkZvcm1hdHRlciBpbXBsZW1lbnRzIElMb2dFbnRyeUZvcm1hdHRlciB7XG4gIC8qKlxuICAgKiBGb3JtYXRzIGEgbG9nIGVudHJ5IGFzIFtUSU1FXSBbTEVWRUxdIE1FU1NBR0VcbiAgICogQHBhcmFtIGVudHJ5IFRoZSBsb2cgZW50cnlcbiAgICovXG4gIGZvcm1hdChlbnRyeTogSUxvZ0VudHJ5KSA6IHN0cmluZ3tcbiAgICByZXR1cm4gYHt0Oicke2VudHJ5LnRpbWV9JyxsOicke0xvZ0xldmVsW2VudHJ5LmxldmVsXX0nLG06JyR7ZW50cnkubWVzc2FnZX0nfWA7XG4gICAgLy8gIHJldHVybiBqc29uLnN0cmluZ2lmeShlbnRyeSk7XG4gICAvLyByZXR1cm4gSlNPTi4gc3RyaW5naWZ5KGVudHJ5KTtcbiAgfVxufVxuIl19
