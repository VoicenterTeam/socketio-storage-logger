"use strict";
/**
 * Each node corresponds to an entry within the queue. This helps with
 * storage and removal from local storage.
 */
var Node = (function () {
    /**
     * Constructs a node representing an entry in the queue.
     * @param config The queue configuration. This is used to provide the prefix for the key.
     * @param index The index within the queue
     * @param value The value of the entry
     */
    function Node(config, index, value) {
        this.value = value;
        this._key = Node.createKey(config, index);
        this._serializedNode = JSON.stringify(value);
    }
    /**
     * Returns an estimate of the size this will take up in local storage.
     */
    Node.prototype.estimatedSize = function () {
        return this._serializedNode.length + this._key.length;
    };
    /**
     * Stores the serialized entry in local storage.
     */
    Node.prototype.store = function () {
        localStorage.setItem(this._key, this._serializedNode);
    };
    /**
     * Removes the entry from local storage if it exists.
     */
    Node.prototype.remove = function () {
        localStorage.removeItem(this._key);
    };
    /**
     * Creates a key for an entry.
     * @param config The configuration containing the key prefix
     * @param index The index of the entry in the queue
     */
    Node.createKey = function (config, index) {
        return config.keyPrefix + "-item-" + index;
    };
    /**
     * Loads an entry from local storage and deserializes it. Returns the associated node.
     * @param config The configuration containing the key prefix
     * @param index The index of the entry in the queue
     */
    Node.fromLocalStorage = function (config, index) {
        var serializedNode = localStorage.getItem(Node.createKey(config, index));
        var value = JSON.parse(serializedNode);
        return new Node(config, index, value);
    };
    return Node;
}());
exports.Node = Node;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInF1ZXVlL05vZGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUVBOzs7R0FHRztBQUNIO0lBSUU7Ozs7O09BS0c7SUFDSCxjQUFZLE1BQTJCLEVBQUUsS0FBYSxFQUFTLEtBQVE7UUFBUixVQUFLLEdBQUwsS0FBSyxDQUFHO1FBQ3JFLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDMUMsSUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQy9DLENBQUM7SUFFRDs7T0FFRztJQUNILDRCQUFhLEdBQWI7UUFDRSxNQUFNLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUM7SUFDeEQsQ0FBQztJQUVEOztPQUVHO0lBQ0gsb0JBQUssR0FBTDtRQUNFLFlBQVksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUM7SUFDeEQsQ0FBQztJQUVEOztPQUVHO0lBQ0gscUJBQU0sR0FBTjtRQUNFLFlBQVksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3JDLENBQUM7SUFFRDs7OztPQUlHO0lBQ0ksY0FBUyxHQUFoQixVQUFpQixNQUEyQixFQUFFLEtBQWE7UUFDekQsTUFBTSxDQUFJLE1BQU0sQ0FBQyxTQUFTLGNBQVMsS0FBTyxDQUFDO0lBQzdDLENBQUM7SUFFRDs7OztPQUlHO0lBQ0kscUJBQWdCLEdBQXZCLFVBQTJCLE1BQTJCLEVBQUUsS0FBYTtRQUNuRSxJQUFNLGNBQWMsR0FBRyxZQUFZLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFDM0UsSUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxjQUFjLENBQUMsQ0FBQztRQUN6QyxNQUFNLENBQUMsSUFBSSxJQUFJLENBQUksTUFBTSxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztJQUMzQyxDQUFDO0lBQ0gsV0FBQztBQUFELENBdkRBLEFBdURDLElBQUE7QUF2RFksWUFBSSxPQXVEaEIsQ0FBQSIsImZpbGUiOiJxdWV1ZS9Ob2RlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtJUXVldWVDb25maWd1cmF0aW9ufSBmcm9tICcuL0lRdWV1ZUNvbmZpZ3VyYXRpb24nO1xyXG5cclxuLyoqXHJcbiAqIEVhY2ggbm9kZSBjb3JyZXNwb25kcyB0byBhbiBlbnRyeSB3aXRoaW4gdGhlIHF1ZXVlLiBUaGlzIGhlbHBzIHdpdGhcclxuICogc3RvcmFnZSBhbmQgcmVtb3ZhbCBmcm9tIGxvY2FsIHN0b3JhZ2UuXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgTm9kZTxUPiB7XHJcbiAgcHJpdmF0ZSBfa2V5OiBzdHJpbmc7XHJcbiAgcHJpdmF0ZSBfc2VyaWFsaXplZE5vZGU6IHN0cmluZztcclxuXHJcbiAgLyoqXHJcbiAgICogQ29uc3RydWN0cyBhIG5vZGUgcmVwcmVzZW50aW5nIGFuIGVudHJ5IGluIHRoZSBxdWV1ZS5cclxuICAgKiBAcGFyYW0gY29uZmlnIFRoZSBxdWV1ZSBjb25maWd1cmF0aW9uLiBUaGlzIGlzIHVzZWQgdG8gcHJvdmlkZSB0aGUgcHJlZml4IGZvciB0aGUga2V5LlxyXG4gICAqIEBwYXJhbSBpbmRleCBUaGUgaW5kZXggd2l0aGluIHRoZSBxdWV1ZVxyXG4gICAqIEBwYXJhbSB2YWx1ZSBUaGUgdmFsdWUgb2YgdGhlIGVudHJ5XHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoY29uZmlnOiBJUXVldWVDb25maWd1cmF0aW9uLCBpbmRleDogbnVtYmVyLCBwdWJsaWMgdmFsdWU6IFQpIHtcclxuICAgIHRoaXMuX2tleSA9IE5vZGUuY3JlYXRlS2V5KGNvbmZpZywgaW5kZXgpO1xyXG4gICAgdGhpcy5fc2VyaWFsaXplZE5vZGUgPSBKU09OLnN0cmluZ2lmeSh2YWx1ZSk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIGFuIGVzdGltYXRlIG9mIHRoZSBzaXplIHRoaXMgd2lsbCB0YWtlIHVwIGluIGxvY2FsIHN0b3JhZ2UuXHJcbiAgICovXHJcbiAgZXN0aW1hdGVkU2l6ZSgpIHtcclxuICAgIHJldHVybiB0aGlzLl9zZXJpYWxpemVkTm9kZS5sZW5ndGggKyB0aGlzLl9rZXkubGVuZ3RoO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU3RvcmVzIHRoZSBzZXJpYWxpemVkIGVudHJ5IGluIGxvY2FsIHN0b3JhZ2UuXHJcbiAgICovXHJcbiAgc3RvcmUoKSB7XHJcbiAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSh0aGlzLl9rZXksIHRoaXMuX3NlcmlhbGl6ZWROb2RlKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlbW92ZXMgdGhlIGVudHJ5IGZyb20gbG9jYWwgc3RvcmFnZSBpZiBpdCBleGlzdHMuXHJcbiAgICovXHJcbiAgcmVtb3ZlKCkge1xyXG4gICAgbG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0odGhpcy5fa2V5KTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENyZWF0ZXMgYSBrZXkgZm9yIGFuIGVudHJ5LlxyXG4gICAqIEBwYXJhbSBjb25maWcgVGhlIGNvbmZpZ3VyYXRpb24gY29udGFpbmluZyB0aGUga2V5IHByZWZpeFxyXG4gICAqIEBwYXJhbSBpbmRleCBUaGUgaW5kZXggb2YgdGhlIGVudHJ5IGluIHRoZSBxdWV1ZVxyXG4gICAqL1xyXG4gIHN0YXRpYyBjcmVhdGVLZXkoY29uZmlnOiBJUXVldWVDb25maWd1cmF0aW9uLCBpbmRleDogbnVtYmVyKSB7XHJcbiAgICByZXR1cm4gYCR7Y29uZmlnLmtleVByZWZpeH0taXRlbS0ke2luZGV4fWA7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBMb2FkcyBhbiBlbnRyeSBmcm9tIGxvY2FsIHN0b3JhZ2UgYW5kIGRlc2VyaWFsaXplcyBpdC4gUmV0dXJucyB0aGUgYXNzb2NpYXRlZCBub2RlLlxyXG4gICAqIEBwYXJhbSBjb25maWcgVGhlIGNvbmZpZ3VyYXRpb24gY29udGFpbmluZyB0aGUga2V5IHByZWZpeFxyXG4gICAqIEBwYXJhbSBpbmRleCBUaGUgaW5kZXggb2YgdGhlIGVudHJ5IGluIHRoZSBxdWV1ZVxyXG4gICAqL1xyXG4gIHN0YXRpYyBmcm9tTG9jYWxTdG9yYWdlPFQ+KGNvbmZpZzogSVF1ZXVlQ29uZmlndXJhdGlvbiwgaW5kZXg6IG51bWJlcikge1xyXG4gICAgY29uc3Qgc2VyaWFsaXplZE5vZGUgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbShOb2RlLmNyZWF0ZUtleShjb25maWcsIGluZGV4KSk7XHJcbiAgICBjb25zdCB2YWx1ZSA9IEpTT04ucGFyc2Uoc2VyaWFsaXplZE5vZGUpO1xyXG4gICAgcmV0dXJuIG5ldyBOb2RlPFQ+KGNvbmZpZywgaW5kZXgsIHZhbHVlKTtcclxuICB9XHJcbn1cclxuIl19
