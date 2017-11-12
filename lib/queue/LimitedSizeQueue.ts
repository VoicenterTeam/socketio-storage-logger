import {Node} from './Node';
import {Bookkeeper} from './Bookkeeper';
import {IQueueConfiguration} from './IQueueConfiguration';

/**
 * A limited-size queue that is persisted to local storage. Enqueuing
 * elements can remove the oldest elements in order to free up space.
 */
export class  LimitedSizeQueue<T> {
  private _bookkeeper: Bookkeeper<T>;

  /**
   * Creates/restores a queue based on the configuration provided.
   * @param _config The settings for the queue
   */
  constructor(private _config: IQueueConfiguration) {
    this._bookkeeper = new Bookkeeper<T>(_config);
    this._bookkeeper.reset();
  }

  /**
   * Enqueues an item in the queue. Throws if the value is too big to fit in local storage
   * based on the maximum sized defined in the queue configuration. May also throw
   * if local storage is out of space or corrupted.
   */
  enqueue(value: T) : void {
    const node = this._bookkeeper.createNextNode(value);
    const spaceRequirement = node.estimatedSize();
    const canFit = this._config.maxSizeInBytes >= spaceRequirement;
    if (!canFit) {
      const message = 'LSL: Value is too big to store. Reverting to previous state.';
      console.error(message);
      this._bookkeeper.reset();
      throw new Error(message);
    }
    const remainingSpace = this._bookkeeper.remainingSpace();
    if (remainingSpace >= 0) {
      this._bookkeeper.store();
    } else {
      while (this._bookkeeper.remainingSpace() < 0) {
        this._bookkeeper.deleteFirstNode();
      }
      this._bookkeeper.store();
    }
  }

  /**
   * If the queue has at least 1 item, it removes and returns the oldest item from the queue.
   * Otherwise, it will return nothing.
   */
  dequeue() : T | void {
    if (this.isEmpty()) return;
    const node = this._bookkeeper.deleteFirstNode();
    this._bookkeeper.store();
    return node.value;
  }

  /**
   * Returns true if the queue is empty.
   */
  isEmpty() : boolean {
    return this._bookkeeper.isEmpty();
  }

  /**
   * Iterates (without removal) through all items stored in the queue.
   */
  iterate(callback: (item: T) => void) {
    this._bookkeeper.iterateIndexValues(i => {
      const node = Node.fromLocalStorage<T>(this._config, i);
      callback(node.value);
    });
  }

  /**
   * Iterates (without removal) through all items stored in the queue.
   */
  iterateForServer(callback: (item: T) => void) {
    this._bookkeeper.iterateIndexValuesForServer(i => {
      const node = Node.fromLocalStorage<T>(this._config, i);
      callback(node.value);
    });
  }

  /**
   * cleanAll  items stored in LocalStorage.
   */
  cleanAll() {

      var arr = []; // Array to hold the keys
      // Iterate over localStorage and insert the keys that meet the condition into arr
      for (var i = 0; i < localStorage.length; i++){
        if (localStorage.key(i).substr( 0, ( this._config.keyPrefix).length) ===  this._config.keyPrefix)
          arr.push(localStorage.key(i));
      }

      for (var  i = 0; i < arr.length; i++) {
        localStorage.removeItem(arr[i]);
      }
    this._bookkeeper.reset();

    }





}
