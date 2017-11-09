"use strict";
/**
 * A logger that doesn't actually do anything. Used for terminating a chain of loggers.
 */
var NullLogger = (function () {
    function NullLogger() {
    }
    /**
     * No-op
     */
    NullLogger.prototype.log = function (entry) {
    };
    return NullLogger;
}());
exports.NullLogger = NullLogger;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxvZ2dlcnMvTnVsbExvZ2dlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBRUE7O0dBRUc7QUFDSDtJQUFBO0lBTUEsQ0FBQztJQUxDOztPQUVHO0lBQ0gsd0JBQUcsR0FBSCxVQUFJLEtBQUs7SUFDVCxDQUFDO0lBQ0gsaUJBQUM7QUFBRCxDQU5BLEFBTUMsSUFBQTtBQU5ZLGtCQUFVLGFBTXRCLENBQUEiLCJmaWxlIjoibG9nZ2Vycy9OdWxsTG9nZ2VyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtJTG9nZ2VyfSBmcm9tICcuL0lMb2dnZXInO1xyXG5cclxuLyoqXHJcbiAqIEEgbG9nZ2VyIHRoYXQgZG9lc24ndCBhY3R1YWxseSBkbyBhbnl0aGluZy4gVXNlZCBmb3IgdGVybWluYXRpbmcgYSBjaGFpbiBvZiBsb2dnZXJzLlxyXG4gKi9cclxuZXhwb3J0IGNsYXNzIE51bGxMb2dnZXIgaW1wbGVtZW50cyBJTG9nZ2VyIHtcclxuICAvKipcclxuICAgKiBOby1vcFxyXG4gICAqL1xyXG4gIGxvZyhlbnRyeSkge1xyXG4gIH1cclxufVxyXG4iXX0=
