"use strict";
var Node_1 = require('./Node');
/**
 * This class keeps track of the start, end and size of the queue
 * stored in local storage. It allows nodes to be created and removed.
 */
var Bookkeeper = (function () {
    /**
     * Creates a new Bookkeeper for a queue. It should be initialized using reset method.
     */
    function Bookkeeper(_config) {
        this._config = _config;
    }
    /**
     * Stores the current state of the queue to local storage.
     */
    Bookkeeper.prototype.store = function () {
        try {
            var serializedInfo = JSON.stringify(this._info);
            // Ideally this would all be inside a transaction {
            this._removed.forEach(function (node) { return node.remove(); });
            this._added.forEach(function (node) { return node.store(); });
            localStorage.setItem(this._config.keyPrefix, serializedInfo);
        }
        finally {
            this._added = [];
            this._removed = [];
        }
    };
    /**
     * Resets the start, end and size counts to what was last persisted to
     * local storage.
     */
    Bookkeeper.prototype.reset = function () {
        this._added = [];
        this._removed = [];
        var serializedInfo = localStorage.getItem(this._config.keyPrefix);
        if (serializedInfo === null) {
            this._info = {
                sizeInBytes: 0,
                startIndex: 0,
                nextFreeIndex: 0
            };
            this.store();
        }
        else {
            this._info = JSON.parse(serializedInfo);
        }
    };
    /**
     * Returns true if the queue has no elements.
     */
    Bookkeeper.prototype.isEmpty = function () {
        return this._info.sizeInBytes === 0;
    };
    /**
     * Calculates the projected free space. This takes into account modifications.
     */
    Bookkeeper.prototype.remainingSpace = function () {
        return this._config.maxSizeInBytes - this._info.sizeInBytes;
    };
    /**
     * Creates a new node at the end of the queue.
     * @param value The value to store as an element of the queue.
     */
    Bookkeeper.prototype.createNextNode = function (value) {
        var node = new Node_1.Node(this._config, this._info.nextFreeIndex, value);
        this._info.nextFreeIndex = this._nextIndex(this._info.nextFreeIndex);
        this._info.sizeInBytes += node.estimatedSize();
        this._added.push(node);
        return node;
    };
    /**
     * Removes and returns the first stored node. The consumer should check that there is a node to remove first.
     */
    Bookkeeper.prototype.deleteFirstNode = function () {
        var node = Node_1.Node.fromLocalStorage(this._config, this._info.startIndex);
        this._info.startIndex = this._nextIndex(this._info.startIndex);
        this._info.sizeInBytes -= node.estimatedSize();
        this._removed.push(node);
        return node;
    };
    /**
     * Iterates through the index values of the elements in the queue. These can be used to retrieve the elements.
     * @param callback The function that will be invoked once for each index value used in the queue.
     */
    Bookkeeper.prototype.iterateIndexValues = function (callback) {
        for (var i = this._info.startIndex; i !== this._info.nextFreeIndex; i = this._nextIndex(i)) {
            callback(i);
        }
    };
    /**
     * Returns the next index value (modulo MAX_SAFE_INTEGER).
     * @param index The previous index value.
     */
    Bookkeeper.prototype._nextIndex = function (index) {
        var MAX_SAFE_INTEGER = 9007199254740991;
        return (index + 1) % MAX_SAFE_INTEGER;
    };
    return Bookkeeper;
}());
exports.Bookkeeper = Bookkeeper;

//# sourceMappingURL=data:application/json;charset=utf8;base64,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SUFBSSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQzNFLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUMvRCxJQUFJLENBQUMsS0FBSyxDQUFDLFdBQVcsSUFBSSxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7UUFDL0MsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDekIsTUFBTSxDQUFDLElBQUksQ0FBQztJQUNkLENBQUM7SUFFRDs7O09BR0c7SUFDSCx1Q0FBa0IsR0FBbEIsVUFBbUIsUUFBZ0M7UUFDakQsR0FBRyxDQUFBLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLEVBQUUsQ0FBQyxLQUFLLElBQUksQ0FBQyxLQUFLLENBQUMsYUFBYSxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7WUFDMUYsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2QsQ0FBQztJQUNILENBQUM7SUFFRDs7O09BR0c7SUFDSCwrQkFBVSxHQUFWLFVBQVcsS0FBYTtRQUN0QixJQUFNLGdCQUFnQixHQUFHLGdCQUFnQixDQUFDO1FBQzFDLE1BQU0sQ0FBQyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsR0FBRyxnQkFBZ0IsQ0FBQztJQUN4QyxDQUFDO0lBQ0gsaUJBQUM7QUFBRCxDQXZHQSxBQXVHQyxJQUFBO0FBdkdZLGtCQUFVLGFBdUd0QixDQUFBIiwiZmlsZSI6InF1ZXVlL0Jvb2trZWVwZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0lRdWV1ZUNvbmZpZ3VyYXRpb259IGZyb20gJy4vSVF1ZXVlQ29uZmlndXJhdGlvbic7XHJcbmltcG9ydCB7SUJvb2trZWVwaW5nSW5mb30gZnJvbSAnLi9JQm9va2tlZXBpbmdJbmZvJztcclxuaW1wb3J0IHtOb2RlfSBmcm9tICcuL05vZGUnO1xyXG5cclxuLyoqXHJcbiAqIFRoaXMgY2xhc3Mga2VlcHMgdHJhY2sgb2YgdGhlIHN0YXJ0LCBlbmQgYW5kIHNpemUgb2YgdGhlIHF1ZXVlXHJcbiAqIHN0b3JlZCBpbiBsb2NhbCBzdG9yYWdlLiBJdCBhbGxvd3Mgbm9kZXMgdG8gYmUgY3JlYXRlZCBhbmQgcmVtb3ZlZC5cclxuICovIFxyXG5leHBvcnQgY2xhc3MgQm9va2tlZXBlcjxUPiB7XHJcbiAgcHJpdmF0ZSBfaW5mbzogSUJvb2trZWVwaW5nSW5mbzsgXHJcbiAgcHJpdmF0ZSBfYWRkZWQ6IEFycmF5PE5vZGU8VD4+O1xyXG4gIHByaXZhdGUgX3JlbW92ZWQ6IEFycmF5PE5vZGU8VD4+O1xyXG5cclxuICAvKipcclxuICAgKiBDcmVhdGVzIGEgbmV3IEJvb2trZWVwZXIgZm9yIGEgcXVldWUuIEl0IHNob3VsZCBiZSBpbml0aWFsaXplZCB1c2luZyByZXNldCBtZXRob2QuXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IocHJpdmF0ZSBfY29uZmlnOiBJUXVldWVDb25maWd1cmF0aW9uKSB7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTdG9yZXMgdGhlIGN1cnJlbnQgc3RhdGUgb2YgdGhlIHF1ZXVlIHRvIGxvY2FsIHN0b3JhZ2UuXHJcbiAgICovXHJcbiAgc3RvcmUoKSB7XHJcbiAgICB0cnkge1xyXG4gICAgICBjb25zdCBzZXJpYWxpemVkSW5mbyA9IEpTT04uc3RyaW5naWZ5KHRoaXMuX2luZm8pO1xyXG4gICAgICAvLyBJZGVhbGx5IHRoaXMgd291bGQgYWxsIGJlIGluc2lkZSBhIHRyYW5zYWN0aW9uIHtcclxuICAgICAgdGhpcy5fcmVtb3ZlZC5mb3JFYWNoKG5vZGUgPT4gbm9kZS5yZW1vdmUoKSk7XHJcbiAgICAgIHRoaXMuX2FkZGVkLmZvckVhY2gobm9kZSA9PiBub2RlLnN0b3JlKCkpO1xyXG4gICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSh0aGlzLl9jb25maWcua2V5UHJlZml4LCBzZXJpYWxpemVkSW5mbyk7XHJcbiAgICAgIC8vIH1cclxuICAgIH0gZmluYWxseSB7XHJcbiAgICAgIHRoaXMuX2FkZGVkID0gW107XHJcbiAgICAgIHRoaXMuX3JlbW92ZWQgPSBbXTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlc2V0cyB0aGUgc3RhcnQsIGVuZCBhbmQgc2l6ZSBjb3VudHMgdG8gd2hhdCB3YXMgbGFzdCBwZXJzaXN0ZWQgdG9cclxuICAgKiBsb2NhbCBzdG9yYWdlLlxyXG4gICAqL1xyXG4gIHJlc2V0KCkge1xyXG4gICAgdGhpcy5fYWRkZWQgPSBbXTtcclxuICAgIHRoaXMuX3JlbW92ZWQgPSBbXTtcclxuICAgIGNvbnN0IHNlcmlhbGl6ZWRJbmZvID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0odGhpcy5fY29uZmlnLmtleVByZWZpeCk7XHJcbiAgICBpZiAoc2VyaWFsaXplZEluZm8gPT09IG51bGwpIHtcclxuICAgICAgdGhpcy5faW5mbyA9IHtcclxuICAgICAgICBzaXplSW5CeXRlczogMCxcclxuICAgICAgICBzdGFydEluZGV4OiAwLFxyXG4gICAgICAgIG5leHRGcmVlSW5kZXg6IDBcclxuICAgICAgfTtcclxuICAgICAgdGhpcy5zdG9yZSgpOyBcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRoaXMuX2luZm8gPSBKU09OLnBhcnNlKHNlcmlhbGl6ZWRJbmZvKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdHJ1ZSBpZiB0aGUgcXVldWUgaGFzIG5vIGVsZW1lbnRzLlxyXG4gICAqL1xyXG4gIGlzRW1wdHkoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5faW5mby5zaXplSW5CeXRlcyA9PT0gMDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENhbGN1bGF0ZXMgdGhlIHByb2plY3RlZCBmcmVlIHNwYWNlLiBUaGlzIHRha2VzIGludG8gYWNjb3VudCBtb2RpZmljYXRpb25zLlxyXG4gICAqL1xyXG4gIHJlbWFpbmluZ1NwYWNlKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuX2NvbmZpZy5tYXhTaXplSW5CeXRlcyAtIHRoaXMuX2luZm8uc2l6ZUluQnl0ZXM7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDcmVhdGVzIGEgbmV3IG5vZGUgYXQgdGhlIGVuZCBvZiB0aGUgcXVldWUuXHJcbiAgICogQHBhcmFtIHZhbHVlIFRoZSB2YWx1ZSB0byBzdG9yZSBhcyBhbiBlbGVtZW50IG9mIHRoZSBxdWV1ZS5cclxuICAgKi9cclxuICBjcmVhdGVOZXh0Tm9kZSh2YWx1ZTogVCkge1xyXG4gICAgY29uc3Qgbm9kZSA9IG5ldyBOb2RlPFQ+KHRoaXMuX2NvbmZpZywgdGhpcy5faW5mby5uZXh0RnJlZUluZGV4LCB2YWx1ZSk7XHJcbiAgICB0aGlzLl9pbmZvLm5leHRGcmVlSW5kZXggPSB0aGlzLl9uZXh0SW5kZXgodGhpcy5faW5mby5uZXh0RnJlZUluZGV4KTtcclxuICAgIHRoaXMuX2luZm8uc2l6ZUluQnl0ZXMgKz0gbm9kZS5lc3RpbWF0ZWRTaXplKCk7XHJcbiAgICB0aGlzLl9hZGRlZC5wdXNoKG5vZGUpO1xyXG4gICAgcmV0dXJuIG5vZGU7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZW1vdmVzIGFuZCByZXR1cm5zIHRoZSBmaXJzdCBzdG9yZWQgbm9kZS4gVGhlIGNvbnN1bWVyIHNob3VsZCBjaGVjayB0aGF0IHRoZXJlIGlzIGEgbm9kZSB0byByZW1vdmUgZmlyc3QuXHJcbiAgICovXHJcbiAgZGVsZXRlRmlyc3ROb2RlKCkge1xyXG4gICAgY29uc3Qgbm9kZSA9IE5vZGUuZnJvbUxvY2FsU3RvcmFnZTxUPih0aGlzLl9jb25maWcsIHRoaXMuX2luZm8uc3RhcnRJbmRleCk7XHJcbiAgICB0aGlzLl9pbmZvLnN0YXJ0SW5kZXggPSB0aGlzLl9uZXh0SW5kZXgodGhpcy5faW5mby5zdGFydEluZGV4KTtcclxuICAgIHRoaXMuX2luZm8uc2l6ZUluQnl0ZXMgLT0gbm9kZS5lc3RpbWF0ZWRTaXplKCk7XHJcbiAgICB0aGlzLl9yZW1vdmVkLnB1c2gobm9kZSk7XHJcbiAgICByZXR1cm4gbm9kZTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEl0ZXJhdGVzIHRocm91Z2ggdGhlIGluZGV4IHZhbHVlcyBvZiB0aGUgZWxlbWVudHMgaW4gdGhlIHF1ZXVlLiBUaGVzZSBjYW4gYmUgdXNlZCB0byByZXRyaWV2ZSB0aGUgZWxlbWVudHMuXHJcbiAgICogQHBhcmFtIGNhbGxiYWNrIFRoZSBmdW5jdGlvbiB0aGF0IHdpbGwgYmUgaW52b2tlZCBvbmNlIGZvciBlYWNoIGluZGV4IHZhbHVlIHVzZWQgaW4gdGhlIHF1ZXVlLlxyXG4gICAqL1xyXG4gIGl0ZXJhdGVJbmRleFZhbHVlcyhjYWxsYmFjazogKGluZGV4Om51bWJlcikgPT4gdm9pZCkge1xyXG4gICAgZm9yKGxldCBpID0gdGhpcy5faW5mby5zdGFydEluZGV4OyBpICE9PSB0aGlzLl9pbmZvLm5leHRGcmVlSW5kZXg7IGkgPSB0aGlzLl9uZXh0SW5kZXgoaSkpIHtcclxuICAgICAgY2FsbGJhY2soaSk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSBuZXh0IGluZGV4IHZhbHVlIChtb2R1bG8gTUFYX1NBRkVfSU5URUdFUikuXHJcbiAgICogQHBhcmFtIGluZGV4IFRoZSBwcmV2aW91cyBpbmRleCB2YWx1ZS5cclxuICAgKi9cclxuICBfbmV4dEluZGV4KGluZGV4OiBudW1iZXIpIHtcclxuICAgIGNvbnN0IE1BWF9TQUZFX0lOVEVHRVIgPSA5MDA3MTk5MjU0NzQwOTkxO1xyXG4gICAgcmV0dXJuIChpbmRleCArIDEpICUgTUFYX1NBRkVfSU5URUdFUjtcclxuICB9XHJcbn1cclxuIl19
