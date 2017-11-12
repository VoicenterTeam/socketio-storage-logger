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
     * Calculates the sizeInBytes .
     */
    Bookkeeper.prototype.checkSizeInBytes = function () {
        return this._info.sizeInBytes;
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
    Bookkeeper.prototype.iterateIndexValuesForServer = function (callback) {
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,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QUFLLENBQUMsZUFBZSxFQUFFLENBQUMsS0FBSyxJQUFJLENBQUMsS0FBSyxDQUFDLGFBQWEsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO1lBQy9GLElBQUksQ0FBQyxLQUFLLENBQUMsZUFBZSxHQUFDLENBQUMsR0FBQyxDQUFDLENBQUM7WUFDakMsOERBQThEO1lBQzVELFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNkLENBQUM7SUFDSCxDQUFDO0lBRUQ7OztPQUdHO0lBQ0gsK0JBQVUsR0FBVixVQUFXLEtBQWE7UUFDdEIsSUFBTSxnQkFBZ0IsR0FBRyxnQkFBZ0IsQ0FBQztRQUMxQyxNQUFNLENBQUMsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLEdBQUcsZ0JBQWdCLENBQUM7SUFDeEMsQ0FBQztJQUNILGlCQUFDO0FBQUQsQ0E5SEEsQUE4SEMsSUFBQTtBQTlIWSxrQkFBVSxhQThIdEIsQ0FBQSIsImZpbGUiOiJxdWV1ZS9Cb29ra2VlcGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtJUXVldWVDb25maWd1cmF0aW9ufSBmcm9tICcuL0lRdWV1ZUNvbmZpZ3VyYXRpb24nO1xuaW1wb3J0IHtJQm9va2tlZXBpbmdJbmZvfSBmcm9tICcuL0lCb29ra2VlcGluZ0luZm8nO1xuaW1wb3J0IHtOb2RlfSBmcm9tICcuL05vZGUnO1xuXG4vKipcbiAqIFRoaXMgY2xhc3Mga2VlcHMgdHJhY2sgb2YgdGhlIHN0YXJ0LCBlbmQgYW5kIHNpemUgb2YgdGhlIHF1ZXVlXG4gKiBzdG9yZWQgaW4gbG9jYWwgc3RvcmFnZS4gSXQgYWxsb3dzIG5vZGVzIHRvIGJlIGNyZWF0ZWQgYW5kIHJlbW92ZWQuXG4gKi9cbmV4cG9ydCBjbGFzcyBCb29ra2VlcGVyPFQ+IHtcbiAgcHJpdmF0ZSBfaW5mbzogSUJvb2trZWVwaW5nSW5mbztcbiAgcHJpdmF0ZSBfYWRkZWQ6IEFycmF5PE5vZGU8VD4+O1xuICBwcml2YXRlIF9yZW1vdmVkOiBBcnJheTxOb2RlPFQ+PjtcblxuICAvKipcbiAgICogQ3JlYXRlcyBhIG5ldyBCb29ra2VlcGVyIGZvciBhIHF1ZXVlLiBJdCBzaG91bGQgYmUgaW5pdGlhbGl6ZWQgdXNpbmcgcmVzZXQgbWV0aG9kLlxuICAgKi9cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBfY29uZmlnOiBJUXVldWVDb25maWd1cmF0aW9uKSB7XG4gIH1cblxuICAvKipcbiAgICogU3RvcmVzIHRoZSBjdXJyZW50IHN0YXRlIG9mIHRoZSBxdWV1ZSB0byBsb2NhbCBzdG9yYWdlLlxuICAgKi9cbiAgc3RvcmUoKSB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHNlcmlhbGl6ZWRJbmZvID0gSlNPTi5zdHJpbmdpZnkodGhpcy5faW5mbyk7XG4gICAgICAvLyBJZGVhbGx5IHRoaXMgd291bGQgYWxsIGJlIGluc2lkZSBhIHRyYW5zYWN0aW9uIHtcbiAgICAgIHRoaXMuX3JlbW92ZWQuZm9yRWFjaChub2RlID0+IG5vZGUucmVtb3ZlKCkpO1xuICAgICAgdGhpcy5fYWRkZWQuZm9yRWFjaChub2RlID0+IG5vZGUuc3RvcmUoKSk7XG4gICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSh0aGlzLl9jb25maWcua2V5UHJlZml4LCBzZXJpYWxpemVkSW5mbyk7XG4gICAgICAvLyB9XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHRoaXMuX2FkZGVkID0gW107XG4gICAgICB0aGlzLl9yZW1vdmVkID0gW107XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJlc2V0cyB0aGUgc3RhcnQsIGVuZCBhbmQgc2l6ZSBjb3VudHMgdG8gd2hhdCB3YXMgbGFzdCBwZXJzaXN0ZWQgdG9cbiAgICogbG9jYWwgc3RvcmFnZS5cbiAgICovXG4gIHJlc2V0KCkge1xuICAgIHRoaXMuX2FkZGVkID0gW107XG4gICAgdGhpcy5fcmVtb3ZlZCA9IFtdO1xuICAgIGNvbnN0IHNlcmlhbGl6ZWRJbmZvID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0odGhpcy5fY29uZmlnLmtleVByZWZpeCk7XG4gICAgaWYgKHNlcmlhbGl6ZWRJbmZvID09PSBudWxsKSB7XG4gICAgICB0aGlzLl9pbmZvID0ge1xuICAgICAgICBzaXplSW5CeXRlczogMCxcbiAgICAgICAgc3RhcnRJbmRleDogMCxcbiAgICAgICAgbmV4dEZyZWVJbmRleDogMCxcbiAgICAgICAgbGFzdFNlcnZlckluZGV4OiAwXG4gICAgICB9O1xuICAgICAgdGhpcy5zdG9yZSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9pbmZvID0gSlNPTi5wYXJzZShzZXJpYWxpemVkSW5mbyk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdHJ1ZSBpZiB0aGUgcXVldWUgaGFzIG5vIGVsZW1lbnRzLlxuICAgKi9cbiAgaXNFbXB0eSgpIHtcbiAgICByZXR1cm4gdGhpcy5faW5mby5zaXplSW5CeXRlcyA9PT0gMDtcbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxjdWxhdGVzIHRoZSBwcm9qZWN0ZWQgZnJlZSBzcGFjZS4gVGhpcyB0YWtlcyBpbnRvIGFjY291bnQgbW9kaWZpY2F0aW9ucy5cbiAgICovXG4gIHJlbWFpbmluZ1NwYWNlKCkge1xuICAgIHJldHVybiB0aGlzLl9jb25maWcubWF4U2l6ZUluQnl0ZXMgLSB0aGlzLl9pbmZvLnNpemVJbkJ5dGVzO1xuICB9XG5cbiAgLyoqXG4gICAqIENhbGN1bGF0ZXMgdGhlIHNpemVJbkJ5dGVzIC5cbiAgICovXG4gIGNoZWNrU2l6ZUluQnl0ZXMoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2luZm8uc2l6ZUluQnl0ZXM7XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlcyBhIG5ldyBub2RlIGF0IHRoZSBlbmQgb2YgdGhlIHF1ZXVlLlxuICAgKiBAcGFyYW0gdmFsdWUgVGhlIHZhbHVlIHRvIHN0b3JlIGFzIGFuIGVsZW1lbnQgb2YgdGhlIHF1ZXVlLlxuICAgKi9cbiAgY3JlYXRlTmV4dE5vZGUodmFsdWU6IFQpIHtcbiAgICBjb25zdCBub2RlID0gbmV3IE5vZGU8VD4odGhpcy5fY29uZmlnLCB0aGlzLl9pbmZvLm5leHRGcmVlSW5kZXgsIHZhbHVlKTtcbiAgICB0aGlzLl9pbmZvLm5leHRGcmVlSW5kZXggPSB0aGlzLl9uZXh0SW5kZXgodGhpcy5faW5mby5uZXh0RnJlZUluZGV4KTtcbiAgICB0aGlzLl9pbmZvLnNpemVJbkJ5dGVzICs9IG5vZGUuZXN0aW1hdGVkU2l6ZSgpO1xuICAgIHRoaXMuX2FkZGVkLnB1c2gobm9kZSk7XG4gICAgcmV0dXJuIG5vZGU7XG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlcyBhbmQgcmV0dXJucyB0aGUgZmlyc3Qgc3RvcmVkIG5vZGUuIFRoZSBjb25zdW1lciBzaG91bGQgY2hlY2sgdGhhdCB0aGVyZSBpcyBhIG5vZGUgdG8gcmVtb3ZlIGZpcnN0LlxuICAgKi9cbiAgZGVsZXRlRmlyc3ROb2RlKCkge1xuICAgIGNvbnN0IG5vZGUgPSBOb2RlLmZyb21Mb2NhbFN0b3JhZ2U8VD4odGhpcy5fY29uZmlnLCB0aGlzLl9pbmZvLnN0YXJ0SW5kZXgpO1xuICAgIHRoaXMuX2luZm8uc3RhcnRJbmRleCA9IHRoaXMuX25leHRJbmRleCh0aGlzLl9pbmZvLnN0YXJ0SW5kZXgpO1xuICAgIC8vbWFrZSBzdXJlIHdlIGRvbnQgdHJ5IHRvIHNlbmQgdG8gdGhlIHNlcnZlciBsb2dzIHRoYXQgYWxscmVkeSBiZWVuIGRlbGV0ZWRcbiAgICBpZih0aGlzLl9pbmZvLnN0YXJ0SW5kZXg+dGhpcy5faW5mby5sYXN0U2VydmVySW5kZXgpIHRoaXMuX2luZm8ubGFzdFNlcnZlckluZGV4PXRoaXMuX2luZm8uc3RhcnRJbmRleDtcbiAgICB0aGlzLl9pbmZvLnNpemVJbkJ5dGVzIC09IG5vZGUuZXN0aW1hdGVkU2l6ZSgpO1xuICAgIHRoaXMuX3JlbW92ZWQucHVzaChub2RlKTtcbiAgICByZXR1cm4gbm9kZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJdGVyYXRlcyB0aHJvdWdoIHRoZSBpbmRleCB2YWx1ZXMgb2YgdGhlIGVsZW1lbnRzIGluIHRoZSBxdWV1ZS5cbiAgICogVGhlc2UgY2FuIGJlIHVzZWQgdG8gcmV0cmlldmUgdGhlIGVsZW1lbnRzLlxuICAgKiBAcGFyYW0gY2FsbGJhY2sgVGhlIGZ1bmN0aW9uIHRoYXQgd2lsbCBiZSBpbnZva2VkIG9uY2UgZm9yIGVhY2ggaW5kZXggdmFsdWUgdXNlZCBpbiB0aGUgcXVldWUuXG4gICAqL1xuICBpdGVyYXRlSW5kZXhWYWx1ZXMoY2FsbGJhY2s6IChpbmRleDpudW1iZXIpID0+IHZvaWQpIHtcbiAgICBmb3IobGV0IGkgPSB0aGlzLl9pbmZvLnN0YXJ0SW5kZXg7IGkgIT09IHRoaXMuX2luZm8ubmV4dEZyZWVJbmRleDsgaSA9IHRoaXMuX25leHRJbmRleChpKSkge1xuICAgICAgY2FsbGJhY2soaSk7XG4gICAgfVxuICB9XG4gIC8qKlxuICAgKiBJdGVyYXRlcyB0aHJvdWdoIHRoZSBpbmRleCB2YWx1ZXMgb2YgdGhlIGVsZW1lbnRzIGluIHRoZSBxdWV1ZS5cbiAgICogVGhlc2UgY2FuIGJlIHVzZWQgdG8gcmV0cmlldmUgdGhlIGVsZW1lbnRzLlxuICAgKiBAcGFyYW0gY2FsbGJhY2sgVGhlIGZ1bmN0aW9uIHRoYXQgd2lsbCBiZSBpbnZva2VkIG9uY2UgZm9yIGVhY2ggaW5kZXggdmFsdWUgdXNlZCBpbiB0aGUgcXVldWUuXG4gICAqL1xuICBpdGVyYXRlSW5kZXhWYWx1ZXNGb3JTZXJ2ZXIoY2FsbGJhY2s6IChpbmRleDpudW1iZXIpID0+IHZvaWQpIHtcbiAgICBmb3IobGV0IGkgPSB0aGlzLl9pbmZvLmxhc3RTZXJ2ZXJJbmRleDsgaSAhPT0gdGhpcy5faW5mby5uZXh0RnJlZUluZGV4OyBpID0gdGhpcy5fbmV4dEluZGV4KGkpKSB7XG4gICAgICB0aGlzLl9pbmZvLmxhc3RTZXJ2ZXJJbmRleD1pKzE7XG4gICAgLy8gIGNvbnNvbGUubG9nKFwibGFzdFNlcnZlckluZGV4XCIsdGhpcy5faW5mby5sYXN0U2VydmVySW5kZXgpO1xuICAgICAgY2FsbGJhY2soaSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIG5leHQgaW5kZXggdmFsdWUgKG1vZHVsbyBNQVhfU0FGRV9JTlRFR0VSKS5cbiAgICogQHBhcmFtIGluZGV4IFRoZSBwcmV2aW91cyBpbmRleCB2YWx1ZS5cbiAgICovXG4gIF9uZXh0SW5kZXgoaW5kZXg6IG51bWJlcikge1xuICAgIGNvbnN0IE1BWF9TQUZFX0lOVEVHRVIgPSA5MDA3MTk5MjU0NzQwOTkxO1xuICAgIHJldHVybiAoaW5kZXggKyAxKSAlIE1BWF9TQUZFX0lOVEVHRVI7XG4gIH1cbn1cbiJdfQ==
