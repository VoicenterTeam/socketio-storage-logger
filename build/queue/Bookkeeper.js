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
                nextFreeIndex: 0,
                lastServerIndex: 0
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
        //make sure we dont try to send to the server logs that allredy been deleted
        if (this._info.startIndex > this._info.lastServerIndex)
            this._info.lastServerIndex = this._info.startIndex;
        this._info.sizeInBytes -= node.estimatedSize();
        this._removed.push(node);
        return node;
    };
    /**
     * Iterates through the index values of the elements in the queue.
     * These can be used to retrieve the elements.
     * @param callback The function that will be invoked once for each index value used in the queue.
     */
    Bookkeeper.prototype.iterateIndexValues = function (callback) {
        for (var i = this._info.startIndex; i !== this._info.nextFreeIndex; i = this._nextIndex(i)) {
            callback(i);
        }
    };
    /**
     * Iterates through the index values of the elements in the queue.
     * These can be used to retrieve the elements.
     * @param callback The function that will be invoked once for each index value used in the queue.
     */
    Bookkeeper.prototype.iterateIndexValuesForServe = function (callback) {
        for (var i = this._info.lastServerIndex; i !== this._info.nextFreeIndex; i = this._nextIndex(i)) {
            this._info.lastServerIndex = i + 1;
            //  console.log("lastServerIndex",this._info.lastServerIndex);
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,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QUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7WUFDL0YsSUFBSSxDQUFDLEtBQUssQ0FBQyxlQUFlLEdBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQztZQUNqQyw4REFBOEQ7WUFDNUQsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2QsQ0FBQztJQUNILENBQUM7SUFFRDs7O09BR0c7SUFDSCwrQkFBVSxHQUFWLFVBQVcsS0FBYTtRQUN0QixJQUFNLGdCQUFnQixHQUFHLGdCQUFnQixDQUFDO1FBQzFDLE1BQU0sQ0FBQyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsR0FBRyxnQkFBZ0IsQ0FBQztJQUN4QyxDQUFDO0lBQ0gsaUJBQUM7QUFBRCxDQXZIQSxBQXVIQyxJQUFBO0FBdkhZLGtCQUFVLGFBdUh0QixDQUFBIiwiZmlsZSI6InF1ZXVlL0Jvb2trZWVwZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0lRdWV1ZUNvbmZpZ3VyYXRpb259IGZyb20gJy4vSVF1ZXVlQ29uZmlndXJhdGlvbic7XG5pbXBvcnQge0lCb29ra2VlcGluZ0luZm99IGZyb20gJy4vSUJvb2trZWVwaW5nSW5mbyc7XG5pbXBvcnQge05vZGV9IGZyb20gJy4vTm9kZSc7XG5cbi8qKlxuICogVGhpcyBjbGFzcyBrZWVwcyB0cmFjayBvZiB0aGUgc3RhcnQsIGVuZCBhbmQgc2l6ZSBvZiB0aGUgcXVldWVcbiAqIHN0b3JlZCBpbiBsb2NhbCBzdG9yYWdlLiBJdCBhbGxvd3Mgbm9kZXMgdG8gYmUgY3JlYXRlZCBhbmQgcmVtb3ZlZC5cbiAqL1xuZXhwb3J0IGNsYXNzIEJvb2trZWVwZXI8VD4ge1xuICBwcml2YXRlIF9pbmZvOiBJQm9va2tlZXBpbmdJbmZvO1xuICBwcml2YXRlIF9hZGRlZDogQXJyYXk8Tm9kZTxUPj47XG4gIHByaXZhdGUgX3JlbW92ZWQ6IEFycmF5PE5vZGU8VD4+O1xuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgbmV3IEJvb2trZWVwZXIgZm9yIGEgcXVldWUuIEl0IHNob3VsZCBiZSBpbml0aWFsaXplZCB1c2luZyByZXNldCBtZXRob2QuXG4gICAqL1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF9jb25maWc6IElRdWV1ZUNvbmZpZ3VyYXRpb24pIHtcbiAgfVxuXG4gIC8qKlxuICAgKiBTdG9yZXMgdGhlIGN1cnJlbnQgc3RhdGUgb2YgdGhlIHF1ZXVlIHRvIGxvY2FsIHN0b3JhZ2UuXG4gICAqL1xuICBzdG9yZSgpIHtcbiAgICB0cnkge1xuICAgICAgY29uc3Qgc2VyaWFsaXplZEluZm8gPSBKU09OLnN0cmluZ2lmeSh0aGlzLl9pbmZvKTtcbiAgICAgIC8vIElkZWFsbHkgdGhpcyB3b3VsZCBhbGwgYmUgaW5zaWRlIGEgdHJhbnNhY3Rpb24ge1xuICAgICAgdGhpcy5fcmVtb3ZlZC5mb3JFYWNoKG5vZGUgPT4gbm9kZS5yZW1vdmUoKSk7XG4gICAgICB0aGlzLl9hZGRlZC5mb3JFYWNoKG5vZGUgPT4gbm9kZS5zdG9yZSgpKTtcbiAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKHRoaXMuX2NvbmZpZy5rZXlQcmVmaXgsIHNlcmlhbGl6ZWRJbmZvKTtcbiAgICAgIC8vIH1cbiAgICB9IGZpbmFsbHkge1xuICAgICAgdGhpcy5fYWRkZWQgPSBbXTtcbiAgICAgIHRoaXMuX3JlbW92ZWQgPSBbXTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmVzZXRzIHRoZSBzdGFydCwgZW5kIGFuZCBzaXplIGNvdW50cyB0byB3aGF0IHdhcyBsYXN0IHBlcnNpc3RlZCB0b1xuICAgKiBsb2NhbCBzdG9yYWdlLlxuICAgKi9cbiAgcmVzZXQoKSB7XG4gICAgdGhpcy5fYWRkZWQgPSBbXTtcbiAgICB0aGlzLl9yZW1vdmVkID0gW107XG4gICAgY29uc3Qgc2VyaWFsaXplZEluZm8gPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSh0aGlzLl9jb25maWcua2V5UHJlZml4KTtcbiAgICBpZiAoc2VyaWFsaXplZEluZm8gPT09IG51bGwpIHtcbiAgICAgIHRoaXMuX2luZm8gPSB7XG4gICAgICAgIHNpemVJbkJ5dGVzOiAwLFxuICAgICAgICBzdGFydEluZGV4OiAwLFxuICAgICAgICBuZXh0RnJlZUluZGV4OiAwLFxuICAgICAgICBsYXN0U2VydmVySW5kZXg6IDBcbiAgICAgIH07XG4gICAgICB0aGlzLnN0b3JlKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX2luZm8gPSBKU09OLnBhcnNlKHNlcmlhbGl6ZWRJbmZvKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0cnVlIGlmIHRoZSBxdWV1ZSBoYXMgbm8gZWxlbWVudHMuXG4gICAqL1xuICBpc0VtcHR5KCkge1xuICAgIHJldHVybiB0aGlzLl9pbmZvLnNpemVJbkJ5dGVzID09PSAwO1xuICB9XG5cbiAgLyoqXG4gICAqIENhbGN1bGF0ZXMgdGhlIHByb2plY3RlZCBmcmVlIHNwYWNlLiBUaGlzIHRha2VzIGludG8gYWNjb3VudCBtb2RpZmljYXRpb25zLlxuICAgKi9cbiAgcmVtYWluaW5nU3BhY2UoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2NvbmZpZy5tYXhTaXplSW5CeXRlcyAtIHRoaXMuX2luZm8uc2l6ZUluQnl0ZXM7XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlcyBhIG5ldyBub2RlIGF0IHRoZSBlbmQgb2YgdGhlIHF1ZXVlLlxuICAgKiBAcGFyYW0gdmFsdWUgVGhlIHZhbHVlIHRvIHN0b3JlIGFzIGFuIGVsZW1lbnQgb2YgdGhlIHF1ZXVlLlxuICAgKi9cbiAgY3JlYXRlTmV4dE5vZGUodmFsdWU6IFQpIHtcbiAgICBjb25zdCBub2RlID0gbmV3IE5vZGU8VD4odGhpcy5fY29uZmlnLCB0aGlzLl9pbmZvLm5leHRGcmVlSW5kZXgsIHZhbHVlKTtcbiAgICB0aGlzLl9pbmZvLm5leHRGcmVlSW5kZXggPSB0aGlzLl9uZXh0SW5kZXgodGhpcy5faW5mby5uZXh0RnJlZUluZGV4KTtcbiAgICB0aGlzLl9pbmZvLnNpemVJbkJ5dGVzICs9IG5vZGUuZXN0aW1hdGVkU2l6ZSgpO1xuICAgIHRoaXMuX2FkZGVkLnB1c2gobm9kZSk7XG4gICAgcmV0dXJuIG5vZGU7XG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlcyBhbmQgcmV0dXJucyB0aGUgZmlyc3Qgc3RvcmVkIG5vZGUuIFRoZSBjb25zdW1lciBzaG91bGQgY2hlY2sgdGhhdCB0aGVyZSBpcyBhIG5vZGUgdG8gcmVtb3ZlIGZpcnN0LlxuICAgKi9cbiAgZGVsZXRlRmlyc3ROb2RlKCkge1xuICAgIGNvbnN0IG5vZGUgPSBOb2RlLmZyb21Mb2NhbFN0b3JhZ2U8VD4odGhpcy5fY29uZmlnLCB0aGlzLl9pbmZvLnN0YXJ0SW5kZXgpO1xuICAgIHRoaXMuX2luZm8uc3RhcnRJbmRleCA9IHRoaXMuX25leHRJbmRleCh0aGlzLl9pbmZvLnN0YXJ0SW5kZXgpO1xuICAgIC8vbWFrZSBzdXJlIHdlIGRvbnQgdHJ5IHRvIHNlbmQgdG8gdGhlIHNlcnZlciBsb2dzIHRoYXQgYWxscmVkeSBiZWVuIGRlbGV0ZWRcbiAgICBpZih0aGlzLl9pbmZvLnN0YXJ0SW5kZXg+dGhpcy5faW5mby5sYXN0U2VydmVySW5kZXgpIHRoaXMuX2luZm8ubGFzdFNlcnZlckluZGV4PXRoaXMuX2luZm8uc3RhcnRJbmRleDtcbiAgICB0aGlzLl9pbmZvLnNpemVJbkJ5dGVzIC09IG5vZGUuZXN0aW1hdGVkU2l6ZSgpO1xuICAgIHRoaXMuX3JlbW92ZWQucHVzaChub2RlKTtcbiAgICByZXR1cm4gbm9kZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJdGVyYXRlcyB0aHJvdWdoIHRoZSBpbmRleCB2YWx1ZXMgb2YgdGhlIGVsZW1lbnRzIGluIHRoZSBxdWV1ZS5cbiAgICogVGhlc2UgY2FuIGJlIHVzZWQgdG8gcmV0cmlldmUgdGhlIGVsZW1lbnRzLlxuICAgKiBAcGFyYW0gY2FsbGJhY2sgVGhlIGZ1bmN0aW9uIHRoYXQgd2lsbCBiZSBpbnZva2VkIG9uY2UgZm9yIGVhY2ggaW5kZXggdmFsdWUgdXNlZCBpbiB0aGUgcXVldWUuXG4gICAqL1xuICBpdGVyYXRlSW5kZXhWYWx1ZXMoY2FsbGJhY2s6IChpbmRleDpudW1iZXIpID0+IHZvaWQpIHtcbiAgICBmb3IobGV0IGkgPSB0aGlzLl9pbmZvLnN0YXJ0SW5kZXg7IGkgIT09IHRoaXMuX2luZm8ubmV4dEZyZWVJbmRleDsgaSA9IHRoaXMuX25leHRJbmRleChpKSkge1xuICAgICAgY2FsbGJhY2soaSk7XG4gICAgfVxuICB9XG4gIC8qKlxuICAgKiBJdGVyYXRlcyB0aHJvdWdoIHRoZSBpbmRleCB2YWx1ZXMgb2YgdGhlIGVsZW1lbnRzIGluIHRoZSBxdWV1ZS5cbiAgICogVGhlc2UgY2FuIGJlIHVzZWQgdG8gcmV0cmlldmUgdGhlIGVsZW1lbnRzLlxuICAgKiBAcGFyYW0gY2FsbGJhY2sgVGhlIGZ1bmN0aW9uIHRoYXQgd2lsbCBiZSBpbnZva2VkIG9uY2UgZm9yIGVhY2ggaW5kZXggdmFsdWUgdXNlZCBpbiB0aGUgcXVldWUuXG4gICAqL1xuICBpdGVyYXRlSW5kZXhWYWx1ZXNGb3JTZXJ2ZShjYWxsYmFjazogKGluZGV4Om51bWJlcikgPT4gdm9pZCkge1xuICAgIGZvcihsZXQgaSA9IHRoaXMuX2luZm8ubGFzdFNlcnZlckluZGV4OyBpICE9PSB0aGlzLl9pbmZvLm5leHRGcmVlSW5kZXg7IGkgPSB0aGlzLl9uZXh0SW5kZXgoaSkpIHtcbiAgICAgIHRoaXMuX2luZm8ubGFzdFNlcnZlckluZGV4PWkrMTtcbiAgICAvLyAgY29uc29sZS5sb2coXCJsYXN0U2VydmVySW5kZXhcIix0aGlzLl9pbmZvLmxhc3RTZXJ2ZXJJbmRleCk7XG4gICAgICBjYWxsYmFjayhpKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgbmV4dCBpbmRleCB2YWx1ZSAobW9kdWxvIE1BWF9TQUZFX0lOVEVHRVIpLlxuICAgKiBAcGFyYW0gaW5kZXggVGhlIHByZXZpb3VzIGluZGV4IHZhbHVlLlxuICAgKi9cbiAgX25leHRJbmRleChpbmRleDogbnVtYmVyKSB7XG4gICAgY29uc3QgTUFYX1NBRkVfSU5URUdFUiA9IDkwMDcxOTkyNTQ3NDA5OTE7XG4gICAgcmV0dXJuIChpbmRleCArIDEpICUgTUFYX1NBRkVfSU5URUdFUjtcbiAgfVxufVxuIl19
