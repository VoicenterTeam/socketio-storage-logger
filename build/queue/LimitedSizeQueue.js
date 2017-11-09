"use strict";
var Node_1 = require('./Node');
var Bookkeeper_1 = require('./Bookkeeper');
/**
 * A limited-size queue that is persisted to local storage. Enqueuing
 * elements can remove the oldest elements in order to free up space.
 */
var LimitedSizeQueue = (function () {
    /**
     * Creates/restores a queue based on the configuration provided.
     * @param _config The settings for the queue
     */
    function LimitedSizeQueue(_config) {
        this._config = _config;
        this._bookkeeper = new Bookkeeper_1.Bookkeeper(_config);
        this._bookkeeper.reset();
    }
    /**
     * Enqueues an item in the queue. Throws if the value is too big to fit in local storage
     * based on the maximum sized defined in the queue configuration. May also throw
     * if local storage is out of space or corrupted.
     */
    LimitedSizeQueue.prototype.enqueue = function (value) {
        var node = this._bookkeeper.createNextNode(value);
        var spaceRequirement = node.estimatedSize();
        var canFit = this._config.maxSizeInBytes >= spaceRequirement;
        if (!canFit) {
            var message = 'LSL: Value is too big to store. Reverting to previous state.';
            console.error(message);
            this._bookkeeper.reset();
            throw new Error(message);
        }
        var remainingSpace = this._bookkeeper.remainingSpace();
        if (remainingSpace >= 0) {
            this._bookkeeper.store();
        }
        else {
            while (this._bookkeeper.remainingSpace() < 0) {
                this._bookkeeper.deleteFirstNode();
            }
            this._bookkeeper.store();
        }
    };
    /**
     * If the queue has at least 1 item, it removes and returns the oldest item from the queue.
     * Otherwise, it will return nothing.
     */
    LimitedSizeQueue.prototype.dequeue = function () {
        if (this.isEmpty())
            return;
        var node = this._bookkeeper.deleteFirstNode();
        this._bookkeeper.store();
        return node.value;
    };
    /**
     * Returns true if the queue is empty.
     */
    LimitedSizeQueue.prototype.isEmpty = function () {
        return this._bookkeeper.isEmpty();
    };
    /**
     * Iterates (without removal) through all items stored in the queue.
     */
    LimitedSizeQueue.prototype.iterate = function (callback) {
        var _this = this;
        this._bookkeeper.iterateIndexValues(function (i) {
            var node = Node_1.Node.fromLocalStorage(_this._config, i);
            callback(node.value);
        });
    };
    return LimitedSizeQueue;
}());
exports.LimitedSizeQueue = LimitedSizeQueue;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInF1ZXVlL0xpbWl0ZWRTaXplUXVldWUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLHFCQUFtQixRQUFRLENBQUMsQ0FBQTtBQUM1QiwyQkFBeUIsY0FBYyxDQUFDLENBQUE7QUFHeEM7OztHQUdHO0FBQ0g7SUFHRTs7O09BR0c7SUFDSCwwQkFBb0IsT0FBNEI7UUFBNUIsWUFBTyxHQUFQLE9BQU8sQ0FBcUI7UUFDOUMsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLHVCQUFVLENBQUksT0FBTyxDQUFDLENBQUM7UUFDOUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUMzQixDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILGtDQUFPLEdBQVAsVUFBUSxLQUFRO1FBQ2QsSUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDcEQsSUFBTSxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7UUFDOUMsSUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxjQUFjLElBQUksZ0JBQWdCLENBQUM7UUFDL0QsRUFBRSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1lBQ1osSUFBTSxPQUFPLEdBQUcsOERBQThELENBQUM7WUFDL0UsT0FBTyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUN2QixJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxDQUFDO1lBQ3pCLE1BQU0sSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDM0IsQ0FBQztRQUNELElBQU0sY0FBYyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsY0FBYyxFQUFFLENBQUM7UUFDekQsRUFBRSxDQUFDLENBQUMsY0FBYyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDeEIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUMzQixDQUFDO1FBQUMsSUFBSSxDQUFDLENBQUM7WUFDTixPQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsY0FBYyxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUM7Z0JBQzdDLElBQUksQ0FBQyxXQUFXLENBQUMsZUFBZSxFQUFFLENBQUM7WUFDckMsQ0FBQztZQUNELElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDM0IsQ0FBQztJQUNILENBQUM7SUFFRDs7O09BR0c7SUFDSCxrQ0FBTyxHQUFQO1FBQ0UsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQUMsTUFBTSxDQUFDO1FBQzNCLElBQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsZUFBZSxFQUFFLENBQUM7UUFDaEQsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUN6QixNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQztJQUNwQixDQUFDO0lBRUQ7O09BRUc7SUFDSCxrQ0FBTyxHQUFQO1FBQ0UsTUFBTSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxFQUFFLENBQUM7SUFDcEMsQ0FBQztJQUVEOztPQUVHO0lBQ0gsa0NBQU8sR0FBUCxVQUFRLFFBQTJCO1FBQW5DLGlCQUtDO1FBSkMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxrQkFBa0IsQ0FBQyxVQUFBLENBQUM7WUFDbkMsSUFBTSxJQUFJLEdBQUcsV0FBSSxDQUFDLGdCQUFnQixDQUFJLEtBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUE7WUFDdEQsUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUN2QixDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFDSCx1QkFBQztBQUFELENBakVBLEFBaUVDLElBQUE7QUFqRVksd0JBQWdCLG1CQWlFNUIsQ0FBQSIsImZpbGUiOiJxdWV1ZS9MaW1pdGVkU2l6ZVF1ZXVlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtOb2RlfSBmcm9tICcuL05vZGUnO1xyXG5pbXBvcnQge0Jvb2trZWVwZXJ9IGZyb20gJy4vQm9va2tlZXBlcic7XHJcbmltcG9ydCB7SVF1ZXVlQ29uZmlndXJhdGlvbn0gZnJvbSAnLi9JUXVldWVDb25maWd1cmF0aW9uJztcclxuXHJcbi8qKlxyXG4gKiBBIGxpbWl0ZWQtc2l6ZSBxdWV1ZSB0aGF0IGlzIHBlcnNpc3RlZCB0byBsb2NhbCBzdG9yYWdlLiBFbnF1ZXVpbmdcclxuICogZWxlbWVudHMgY2FuIHJlbW92ZSB0aGUgb2xkZXN0IGVsZW1lbnRzIGluIG9yZGVyIHRvIGZyZWUgdXAgc3BhY2UuXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgTGltaXRlZFNpemVRdWV1ZTxUPiB7XHJcbiAgcHJpdmF0ZSBfYm9va2tlZXBlcjogQm9va2tlZXBlcjxUPjtcclxuXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlcy9yZXN0b3JlcyBhIHF1ZXVlIGJhc2VkIG9uIHRoZSBjb25maWd1cmF0aW9uIHByb3ZpZGVkLlxyXG4gICAqIEBwYXJhbSBfY29uZmlnIFRoZSBzZXR0aW5ncyBmb3IgdGhlIHF1ZXVlXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IocHJpdmF0ZSBfY29uZmlnOiBJUXVldWVDb25maWd1cmF0aW9uKSB7XHJcbiAgICB0aGlzLl9ib29ra2VlcGVyID0gbmV3IEJvb2trZWVwZXI8VD4oX2NvbmZpZyk7XHJcbiAgICB0aGlzLl9ib29ra2VlcGVyLnJlc2V0KCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBFbnF1ZXVlcyBhbiBpdGVtIGluIHRoZSBxdWV1ZS4gVGhyb3dzIGlmIHRoZSB2YWx1ZSBpcyB0b28gYmlnIHRvIGZpdCBpbiBsb2NhbCBzdG9yYWdlXHJcbiAgICogYmFzZWQgb24gdGhlIG1heGltdW0gc2l6ZWQgZGVmaW5lZCBpbiB0aGUgcXVldWUgY29uZmlndXJhdGlvbi4gTWF5IGFsc28gdGhyb3dcclxuICAgKiBpZiBsb2NhbCBzdG9yYWdlIGlzIG91dCBvZiBzcGFjZSBvciBjb3JydXB0ZWQuXHJcbiAgICovXHJcbiAgZW5xdWV1ZSh2YWx1ZTogVCkgOiB2b2lkIHtcclxuICAgIGNvbnN0IG5vZGUgPSB0aGlzLl9ib29ra2VlcGVyLmNyZWF0ZU5leHROb2RlKHZhbHVlKTtcclxuICAgIGNvbnN0IHNwYWNlUmVxdWlyZW1lbnQgPSBub2RlLmVzdGltYXRlZFNpemUoKTtcclxuICAgIGNvbnN0IGNhbkZpdCA9IHRoaXMuX2NvbmZpZy5tYXhTaXplSW5CeXRlcyA+PSBzcGFjZVJlcXVpcmVtZW50O1xyXG4gICAgaWYgKCFjYW5GaXQpIHtcclxuICAgICAgY29uc3QgbWVzc2FnZSA9ICdMU0w6IFZhbHVlIGlzIHRvbyBiaWcgdG8gc3RvcmUuIFJldmVydGluZyB0byBwcmV2aW91cyBzdGF0ZS4nO1xyXG4gICAgICBjb25zb2xlLmVycm9yKG1lc3NhZ2UpO1xyXG4gICAgICB0aGlzLl9ib29ra2VlcGVyLnJlc2V0KCk7XHJcbiAgICAgIHRocm93IG5ldyBFcnJvcihtZXNzYWdlKTtcclxuICAgIH1cclxuICAgIGNvbnN0IHJlbWFpbmluZ1NwYWNlID0gdGhpcy5fYm9va2tlZXBlci5yZW1haW5pbmdTcGFjZSgpO1xyXG4gICAgaWYgKHJlbWFpbmluZ1NwYWNlID49IDApIHtcclxuICAgICAgdGhpcy5fYm9va2tlZXBlci5zdG9yZSgpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgd2hpbGUgKHRoaXMuX2Jvb2trZWVwZXIucmVtYWluaW5nU3BhY2UoKSA8IDApIHtcclxuICAgICAgICB0aGlzLl9ib29ra2VlcGVyLmRlbGV0ZUZpcnN0Tm9kZSgpO1xyXG4gICAgICB9XHJcbiAgICAgIHRoaXMuX2Jvb2trZWVwZXIuc3RvcmUoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIElmIHRoZSBxdWV1ZSBoYXMgYXQgbGVhc3QgMSBpdGVtLCBpdCByZW1vdmVzIGFuZCByZXR1cm5zIHRoZSBvbGRlc3QgaXRlbSBmcm9tIHRoZSBxdWV1ZS5cclxuICAgKiBPdGhlcndpc2UsIGl0IHdpbGwgcmV0dXJuIG5vdGhpbmcuXHJcbiAgICovXHJcbiAgZGVxdWV1ZSgpIDogVCB8IHZvaWQge1xyXG4gICAgaWYgKHRoaXMuaXNFbXB0eSgpKSByZXR1cm47XHJcbiAgICBjb25zdCBub2RlID0gdGhpcy5fYm9va2tlZXBlci5kZWxldGVGaXJzdE5vZGUoKTtcclxuICAgIHRoaXMuX2Jvb2trZWVwZXIuc3RvcmUoKTtcclxuICAgIHJldHVybiBub2RlLnZhbHVlO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0cnVlIGlmIHRoZSBxdWV1ZSBpcyBlbXB0eS5cclxuICAgKi9cclxuICBpc0VtcHR5KCkgOiBib29sZWFuIHtcclxuICAgIHJldHVybiB0aGlzLl9ib29ra2VlcGVyLmlzRW1wdHkoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEl0ZXJhdGVzICh3aXRob3V0IHJlbW92YWwpIHRocm91Z2ggYWxsIGl0ZW1zIHN0b3JlZCBpbiB0aGUgcXVldWUuXHJcbiAgICovXHJcbiAgaXRlcmF0ZShjYWxsYmFjazogKGl0ZW06IFQpID0+IHZvaWQpIHtcclxuICAgIHRoaXMuX2Jvb2trZWVwZXIuaXRlcmF0ZUluZGV4VmFsdWVzKGkgPT4ge1xyXG4gICAgICBjb25zdCBub2RlID0gTm9kZS5mcm9tTG9jYWxTdG9yYWdlPFQ+KHRoaXMuX2NvbmZpZywgaSlcclxuICAgICAgY2FsbGJhY2sobm9kZS52YWx1ZSk7XHJcbiAgICB9KTtcclxuICB9XHJcbn1cclxuIl19
