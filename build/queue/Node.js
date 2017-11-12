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
     * Removes the entry from local storage if it exists.
  
    static removeAll(config: IQueueConfiguration) {
      var arr = []; // Array to hold the keys
  // Iterate over localStorage and insert the keys that meet the condition into arr
      for (var i = 0; i < localStorage.length; i++){
        if (localStorage.key(i).substr( 0, (config.keyPrefix+"-item-").length) === config.keyPrefix+"-item-")
          arr.push(localStorage.key(i));
        }
  
      for (var  i = 0; i < arr.length; i++) {
        localStorage.removeItem(arr[i]);
      }
    }
     */
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInF1ZXVlL05vZGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUVBOzs7R0FHRztBQUNIO0lBSUU7Ozs7O09BS0c7SUFDSCxjQUFZLE1BQTJCLEVBQUUsS0FBYSxFQUFTLEtBQVE7UUFBUixVQUFLLEdBQUwsS0FBSyxDQUFHO1FBQ3JFLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDMUMsSUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQy9DLENBQUM7SUFFRDs7T0FFRztJQUNILDRCQUFhLEdBQWI7UUFDRSxNQUFNLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUM7SUFDeEQsQ0FBQztJQUVEOztPQUVHO0lBQ0gsb0JBQUssR0FBTDtRQUNFLFlBQVksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUM7SUFDeEQsQ0FBQztJQUVEOztPQUVHO0lBQ0gscUJBQU0sR0FBTjtRQUNFLFlBQVksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3JDLENBQUM7SUFDRDs7Ozs7Ozs7Ozs7Ozs7O09BZUc7SUFFSDs7OztPQUlHO0lBQ0ksY0FBUyxHQUFoQixVQUFpQixNQUEyQixFQUFFLEtBQWE7UUFDekQsTUFBTSxDQUFJLE1BQU0sQ0FBQyxTQUFTLGNBQVMsS0FBTyxDQUFDO0lBQzdDLENBQUM7SUFFRDs7OztPQUlHO0lBQ0kscUJBQWdCLEdBQXZCLFVBQTJCLE1BQTJCLEVBQUUsS0FBYTtRQUNuRSxJQUFNLGNBQWMsR0FBRyxZQUFZLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFDM0UsSUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxjQUFjLENBQUMsQ0FBQztRQUN6QyxNQUFNLENBQUMsSUFBSSxJQUFJLENBQUksTUFBTSxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztJQUMzQyxDQUFDO0lBR0gsV0FBQztBQUFELENBekVBLEFBeUVDLElBQUE7QUF6RVksWUFBSSxPQXlFaEIsQ0FBQSIsImZpbGUiOiJxdWV1ZS9Ob2RlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtJUXVldWVDb25maWd1cmF0aW9ufSBmcm9tICcuL0lRdWV1ZUNvbmZpZ3VyYXRpb24nO1xuXG4vKipcbiAqIEVhY2ggbm9kZSBjb3JyZXNwb25kcyB0byBhbiBlbnRyeSB3aXRoaW4gdGhlIHF1ZXVlLiBUaGlzIGhlbHBzIHdpdGhcbiAqIHN0b3JhZ2UgYW5kIHJlbW92YWwgZnJvbSBsb2NhbCBzdG9yYWdlLlxuICovXG5leHBvcnQgY2xhc3MgTm9kZTxUPiB7XG4gIHByaXZhdGUgX2tleTogc3RyaW5nO1xuICBwcml2YXRlIF9zZXJpYWxpemVkTm9kZTogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBDb25zdHJ1Y3RzIGEgbm9kZSByZXByZXNlbnRpbmcgYW4gZW50cnkgaW4gdGhlIHF1ZXVlLlxuICAgKiBAcGFyYW0gY29uZmlnIFRoZSBxdWV1ZSBjb25maWd1cmF0aW9uLiBUaGlzIGlzIHVzZWQgdG8gcHJvdmlkZSB0aGUgcHJlZml4IGZvciB0aGUga2V5LlxuICAgKiBAcGFyYW0gaW5kZXggVGhlIGluZGV4IHdpdGhpbiB0aGUgcXVldWVcbiAgICogQHBhcmFtIHZhbHVlIFRoZSB2YWx1ZSBvZiB0aGUgZW50cnlcbiAgICovXG4gIGNvbnN0cnVjdG9yKGNvbmZpZzogSVF1ZXVlQ29uZmlndXJhdGlvbiwgaW5kZXg6IG51bWJlciwgcHVibGljIHZhbHVlOiBUKSB7XG4gICAgdGhpcy5fa2V5ID0gTm9kZS5jcmVhdGVLZXkoY29uZmlnLCBpbmRleCk7XG4gICAgdGhpcy5fc2VyaWFsaXplZE5vZGUgPSBKU09OLnN0cmluZ2lmeSh2YWx1ZSk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhbiBlc3RpbWF0ZSBvZiB0aGUgc2l6ZSB0aGlzIHdpbGwgdGFrZSB1cCBpbiBsb2NhbCBzdG9yYWdlLlxuICAgKi9cbiAgZXN0aW1hdGVkU2l6ZSgpIHtcbiAgICByZXR1cm4gdGhpcy5fc2VyaWFsaXplZE5vZGUubGVuZ3RoICsgdGhpcy5fa2V5Lmxlbmd0aDtcbiAgfVxuXG4gIC8qKlxuICAgKiBTdG9yZXMgdGhlIHNlcmlhbGl6ZWQgZW50cnkgaW4gbG9jYWwgc3RvcmFnZS5cbiAgICovXG4gIHN0b3JlKCkge1xuICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKHRoaXMuX2tleSwgdGhpcy5fc2VyaWFsaXplZE5vZGUpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZXMgdGhlIGVudHJ5IGZyb20gbG9jYWwgc3RvcmFnZSBpZiBpdCBleGlzdHMuXG4gICAqL1xuICByZW1vdmUoKSB7XG4gICAgbG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0odGhpcy5fa2V5KTtcbiAgfVxuICAvKipcbiAgICogUmVtb3ZlcyB0aGUgZW50cnkgZnJvbSBsb2NhbCBzdG9yYWdlIGlmIGl0IGV4aXN0cy5cblxuICBzdGF0aWMgcmVtb3ZlQWxsKGNvbmZpZzogSVF1ZXVlQ29uZmlndXJhdGlvbikge1xuICAgIHZhciBhcnIgPSBbXTsgLy8gQXJyYXkgdG8gaG9sZCB0aGUga2V5c1xuLy8gSXRlcmF0ZSBvdmVyIGxvY2FsU3RvcmFnZSBhbmQgaW5zZXJ0IHRoZSBrZXlzIHRoYXQgbWVldCB0aGUgY29uZGl0aW9uIGludG8gYXJyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsb2NhbFN0b3JhZ2UubGVuZ3RoOyBpKyspe1xuICAgICAgaWYgKGxvY2FsU3RvcmFnZS5rZXkoaSkuc3Vic3RyKCAwLCAoY29uZmlnLmtleVByZWZpeCtcIi1pdGVtLVwiKS5sZW5ndGgpID09PSBjb25maWcua2V5UHJlZml4K1wiLWl0ZW0tXCIpXG4gICAgICAgIGFyci5wdXNoKGxvY2FsU3RvcmFnZS5rZXkoaSkpO1xuICAgICAgfVxuXG4gICAgZm9yICh2YXIgIGkgPSAwOyBpIDwgYXJyLmxlbmd0aDsgaSsrKSB7XG4gICAgICBsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbShhcnJbaV0pO1xuICAgIH1cbiAgfVxuICAgKi9cblxuICAvKipcbiAgICogQ3JlYXRlcyBhIGtleSBmb3IgYW4gZW50cnkuXG4gICAqIEBwYXJhbSBjb25maWcgVGhlIGNvbmZpZ3VyYXRpb24gY29udGFpbmluZyB0aGUga2V5IHByZWZpeFxuICAgKiBAcGFyYW0gaW5kZXggVGhlIGluZGV4IG9mIHRoZSBlbnRyeSBpbiB0aGUgcXVldWVcbiAgICovXG4gIHN0YXRpYyBjcmVhdGVLZXkoY29uZmlnOiBJUXVldWVDb25maWd1cmF0aW9uLCBpbmRleDogbnVtYmVyKSB7XG4gICAgcmV0dXJuIGAke2NvbmZpZy5rZXlQcmVmaXh9LWl0ZW0tJHtpbmRleH1gO1xuICB9XG5cbiAgLyoqXG4gICAqIExvYWRzIGFuIGVudHJ5IGZyb20gbG9jYWwgc3RvcmFnZSBhbmQgZGVzZXJpYWxpemVzIGl0LiBSZXR1cm5zIHRoZSBhc3NvY2lhdGVkIG5vZGUuXG4gICAqIEBwYXJhbSBjb25maWcgVGhlIGNvbmZpZ3VyYXRpb24gY29udGFpbmluZyB0aGUga2V5IHByZWZpeFxuICAgKiBAcGFyYW0gaW5kZXggVGhlIGluZGV4IG9mIHRoZSBlbnRyeSBpbiB0aGUgcXVldWVcbiAgICovXG4gIHN0YXRpYyBmcm9tTG9jYWxTdG9yYWdlPFQ+KGNvbmZpZzogSVF1ZXVlQ29uZmlndXJhdGlvbiwgaW5kZXg6IG51bWJlcikge1xuICAgIGNvbnN0IHNlcmlhbGl6ZWROb2RlID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oTm9kZS5jcmVhdGVLZXkoY29uZmlnLCBpbmRleCkpO1xuICAgIGNvbnN0IHZhbHVlID0gSlNPTi5wYXJzZShzZXJpYWxpemVkTm9kZSk7XG4gICAgcmV0dXJuIG5ldyBOb2RlPFQ+KGNvbmZpZywgaW5kZXgsIHZhbHVlKTtcbiAgfVxuXG5cbn1cblxuXG4iXX0=
