/**
 * Data entry for the heap.
 */
interface IEntry {
    /**
     * Priority key of the entry
     */
    key: number;
    /**
     * Stored data
     */
    value: number;
}
/**
 * Implements simple minheap priority queue for the Dijkstra algorithm.
 */
export default class MinHeap {
    data: IEntry[];

    constructor() {
        this.data = [];
    }

    /**
     * True if heap is empty
     */
    isEmpty(): boolean {
        return this.data.length === 0;
    }

    /**
     * Pull an element up the tree to its appropriate position
     * @param index : the element's index in the data array
     */
    siftUp(index: number): void {
        if (index <= 0) {
            return;
        }
        const parentindex = Math.floor((index - 1) / 2);
        // Does considered element have higher element than its parent?
        if (this.data[parentindex].key > this.data[index].key) {
            // Move element up 1 level in the tree
            this.swap(parentindex, index);
            // Continue the process on the next level of the tree.
            this.siftUp(parentindex);
        }
    }

    /**
     * Push an element down the tree to its appropriate position
     * @param index : the element's index in the data array
     */
    siftDown(index: number): void {
        // Consider left child
        let minChild = 2 * index + 1;
        // Does left child even exist?
        if (minChild >= this.data.length) {
            return;
        }
        // Does right child exist?
        if (minChild + 1 < this.data.length) {
            // Right child exists, so the child with the lesser key (higher priority) must be chosen
            minChild = (this.data[minChild].key > this.data[minChild + 1].key) ? minChild + 1 : minChild;
        }
        // Finally, does the child with the highest priority have higher priority than the considered element?
        if (this.data[index].key > this.data[minChild].key) {
            // Move element down 1 level in the tree
            this.swap(index, minChild);
            // Continue the process on the next level of the tree.
            this.siftDown(minChild);
        }
    }

    /**
     * Add an element to the heap
     * @param key : the priority key of the element
     * @param value : stored element value
     */
    push(key: number, value: number): void {
        const lastIndex = this.data.length;
        this.data.push({key, value});
        this.siftUp(lastIndex);
    }

    /**
     * Removes and returns the IEntry element with top priority
     * @return IEntry
     */
    pop(): IEntry {
        this.swap(0, this.data.length - 1);
        const returnEntry = this.data.pop();
        this.siftDown(0);
        return returnEntry;
    }

    /**
     * Swaps elements in the data array
     */
    swap(index1: number, index2: number): void {
        const temp = this.data[index1];
        this.data[index1] = this.data[index2];
        this.data[index2] = temp;
    }

    /**
     * Returns the string representation of the heap that remains sorta pretty as long as the keys are single digit numbers
     */
    toString(): string {
        let string = '';
        const depth = Math.floor(Math.log2(this.data.length));
        let levelCount = 1;
        let index = 0;
        for (let i = 0; i <= depth; ++i) {
            string += ' '.repeat(Math.pow(2, depth - i) - 1);
            for (let j = 0; j < levelCount; ++j) {
                string += this.data[index].key;
                string += ' '.repeat(Math.pow(2, depth + 1 - i) - 1);
                ++index;
                if (index === this.data.length) {
                    return string;
                }
            }
            string += '\n';
            levelCount *= 2;
        }
        return string;
    }
}
