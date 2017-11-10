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
    /**
     * Iterates (without removal) through all items stored in the queue.
     */
    LimitedSizeQueue.prototype.iterateForServer = function (callback) {
        var _this = this;
        this._bookkeeper.iterateIndexValuesForServe(function (i) {
            var node = Node_1.Node.fromLocalStorage(_this._config, i);
            callback(node.value);
        });
    };
    return LimitedSizeQueue;
}());
exports.LimitedSizeQueue = LimitedSizeQueue;

//# sourceMappingURL=data:application/json;charset=utf8;base64,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Q0FBSSxLQUFJLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3ZELFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDdkIsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0lBS0gsdUJBQUM7QUFBRCxDQS9FQSxBQStFQyxJQUFBO0FBL0VhLHdCQUFnQixtQkErRTdCLENBQUEiLCJmaWxlIjoicXVldWUvTGltaXRlZFNpemVRdWV1ZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7Tm9kZX0gZnJvbSAnLi9Ob2RlJztcbmltcG9ydCB7Qm9va2tlZXBlcn0gZnJvbSAnLi9Cb29ra2VlcGVyJztcbmltcG9ydCB7SVF1ZXVlQ29uZmlndXJhdGlvbn0gZnJvbSAnLi9JUXVldWVDb25maWd1cmF0aW9uJztcblxuLyoqXG4gKiBBIGxpbWl0ZWQtc2l6ZSBxdWV1ZSB0aGF0IGlzIHBlcnNpc3RlZCB0byBsb2NhbCBzdG9yYWdlLiBFbnF1ZXVpbmdcbiAqIGVsZW1lbnRzIGNhbiByZW1vdmUgdGhlIG9sZGVzdCBlbGVtZW50cyBpbiBvcmRlciB0byBmcmVlIHVwIHNwYWNlLlxuICovXG5leHBvcnQgY2xhc3MgIExpbWl0ZWRTaXplUXVldWU8VD4ge1xuICBwcml2YXRlIF9ib29ra2VlcGVyOiBCb29ra2VlcGVyPFQ+O1xuXG4gIC8qKlxuICAgKiBDcmVhdGVzL3Jlc3RvcmVzIGEgcXVldWUgYmFzZWQgb24gdGhlIGNvbmZpZ3VyYXRpb24gcHJvdmlkZWQuXG4gICAqIEBwYXJhbSBfY29uZmlnIFRoZSBzZXR0aW5ncyBmb3IgdGhlIHF1ZXVlXG4gICAqL1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF9jb25maWc6IElRdWV1ZUNvbmZpZ3VyYXRpb24pIHtcbiAgICB0aGlzLl9ib29ra2VlcGVyID0gbmV3IEJvb2trZWVwZXI8VD4oX2NvbmZpZyk7XG4gICAgdGhpcy5fYm9va2tlZXBlci5yZXNldCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIEVucXVldWVzIGFuIGl0ZW0gaW4gdGhlIHF1ZXVlLiBUaHJvd3MgaWYgdGhlIHZhbHVlIGlzIHRvbyBiaWcgdG8gZml0IGluIGxvY2FsIHN0b3JhZ2VcbiAgICogYmFzZWQgb24gdGhlIG1heGltdW0gc2l6ZWQgZGVmaW5lZCBpbiB0aGUgcXVldWUgY29uZmlndXJhdGlvbi4gTWF5IGFsc28gdGhyb3dcbiAgICogaWYgbG9jYWwgc3RvcmFnZSBpcyBvdXQgb2Ygc3BhY2Ugb3IgY29ycnVwdGVkLlxuICAgKi9cbiAgZW5xdWV1ZSh2YWx1ZTogVCkgOiB2b2lkIHtcbiAgICBjb25zdCBub2RlID0gdGhpcy5fYm9va2tlZXBlci5jcmVhdGVOZXh0Tm9kZSh2YWx1ZSk7XG4gICAgY29uc3Qgc3BhY2VSZXF1aXJlbWVudCA9IG5vZGUuZXN0aW1hdGVkU2l6ZSgpO1xuICAgIGNvbnN0IGNhbkZpdCA9IHRoaXMuX2NvbmZpZy5tYXhTaXplSW5CeXRlcyA+PSBzcGFjZVJlcXVpcmVtZW50O1xuICAgIGlmICghY2FuRml0KSB7XG4gICAgICBjb25zdCBtZXNzYWdlID0gJ0xTTDogVmFsdWUgaXMgdG9vIGJpZyB0byBzdG9yZS4gUmV2ZXJ0aW5nIHRvIHByZXZpb3VzIHN0YXRlLic7XG4gICAgICBjb25zb2xlLmVycm9yKG1lc3NhZ2UpO1xuICAgICAgdGhpcy5fYm9va2tlZXBlci5yZXNldCgpO1xuICAgICAgdGhyb3cgbmV3IEVycm9yKG1lc3NhZ2UpO1xuICAgIH1cbiAgICBjb25zdCByZW1haW5pbmdTcGFjZSA9IHRoaXMuX2Jvb2trZWVwZXIucmVtYWluaW5nU3BhY2UoKTtcbiAgICBpZiAocmVtYWluaW5nU3BhY2UgPj0gMCkge1xuICAgICAgdGhpcy5fYm9va2tlZXBlci5zdG9yZSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICB3aGlsZSAodGhpcy5fYm9va2tlZXBlci5yZW1haW5pbmdTcGFjZSgpIDwgMCkge1xuICAgICAgICB0aGlzLl9ib29ra2VlcGVyLmRlbGV0ZUZpcnN0Tm9kZSgpO1xuICAgICAgfVxuICAgICAgdGhpcy5fYm9va2tlZXBlci5zdG9yZSgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBJZiB0aGUgcXVldWUgaGFzIGF0IGxlYXN0IDEgaXRlbSwgaXQgcmVtb3ZlcyBhbmQgcmV0dXJucyB0aGUgb2xkZXN0IGl0ZW0gZnJvbSB0aGUgcXVldWUuXG4gICAqIE90aGVyd2lzZSwgaXQgd2lsbCByZXR1cm4gbm90aGluZy5cbiAgICovXG4gIGRlcXVldWUoKSA6IFQgfCB2b2lkIHtcbiAgICBpZiAodGhpcy5pc0VtcHR5KCkpIHJldHVybjtcbiAgICBjb25zdCBub2RlID0gdGhpcy5fYm9va2tlZXBlci5kZWxldGVGaXJzdE5vZGUoKTtcbiAgICB0aGlzLl9ib29ra2VlcGVyLnN0b3JlKCk7XG4gICAgcmV0dXJuIG5vZGUudmFsdWU7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0cnVlIGlmIHRoZSBxdWV1ZSBpcyBlbXB0eS5cbiAgICovXG4gIGlzRW1wdHkoKSA6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9ib29ra2VlcGVyLmlzRW1wdHkoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJdGVyYXRlcyAod2l0aG91dCByZW1vdmFsKSB0aHJvdWdoIGFsbCBpdGVtcyBzdG9yZWQgaW4gdGhlIHF1ZXVlLlxuICAgKi9cbiAgaXRlcmF0ZShjYWxsYmFjazogKGl0ZW06IFQpID0+IHZvaWQpIHtcbiAgICB0aGlzLl9ib29ra2VlcGVyLml0ZXJhdGVJbmRleFZhbHVlcyhpID0+IHtcbiAgICAgIGNvbnN0IG5vZGUgPSBOb2RlLmZyb21Mb2NhbFN0b3JhZ2U8VD4odGhpcy5fY29uZmlnLCBpKTtcbiAgICAgIGNhbGxiYWNrKG5vZGUudmFsdWUpO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEl0ZXJhdGVzICh3aXRob3V0IHJlbW92YWwpIHRocm91Z2ggYWxsIGl0ZW1zIHN0b3JlZCBpbiB0aGUgcXVldWUuXG4gICAqL1xuICBpdGVyYXRlRm9yU2VydmVyKGNhbGxiYWNrOiAoaXRlbTogVCkgPT4gdm9pZCkge1xuICAgIHRoaXMuX2Jvb2trZWVwZXIuaXRlcmF0ZUluZGV4VmFsdWVzRm9yU2VydmUoaSA9PiB7XG4gICAgICBjb25zdCBub2RlID0gTm9kZS5mcm9tTG9jYWxTdG9yYWdlPFQ+KHRoaXMuX2NvbmZpZywgaSk7XG4gICAgICBjYWxsYmFjayhub2RlLnZhbHVlKTtcbiAgICB9KTtcbiAgfVxuXG5cblxuXG59XG4iXX0=
