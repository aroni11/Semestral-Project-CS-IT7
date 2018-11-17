/**
 * Implements simple minheap priority queue for the Dijkstra algorithm.
 */
interface IEntry {
        key: number;
        value: number;
}
class MinHeap {
    data: IEntry[];

    constructor() {
        this.data = new Array<IEntry>();
    }
    siftUp(index: number): void {
        const parentindex = Math.floor(index / 2) - 1;
        if (this.data[parentindex].key > this.data[index].key) {
            this.swap(parentindex, index);
            if (parentindex > 0) {
                this.siftUp(parentindex);
            }
        }
    }
    siftDown(index: number): void {
        const leftChild = 2 * index + 1;
        const rightChild = leftChild + 1;
        if (this.data[index].key > this.data[leftChild].key || this.data[index].key > this.data[rightChild].key) {
            const minChild = (this.data[leftChild].key < this.data[rightChild].key) ? leftChild : rightChild;
            this.swap(minChild, index);
            if (minChild !== this.data.length - 1) {
                this.siftDown(minChild);
            }
        }
    }
    push(key: number, value: number): void {
        const lastIndex = this.data.length;
        this.data.push({key, value});
        this.siftUp(lastIndex);
    }

    pop(): IEntry {
        this.swap(0, this.data.length - 1);
        const returnEntry = this.data.pop();
        this.siftDown(0);
        return returnEntry;
    }

    swap(index1: number, index2: number): void {
        const temp = this.data[index1];
        this.data[index1] = this.data[index2];
        this.data[index2] = temp;
    }

    toString(): string {
        let string = '';
        const depth = Math.floor(Math.log2(this.data.length));
        let levelCount = 1;
        let index = 0;
        for (let i = 0; i <= depth; ++i) {
            string += '#'.repeat(Math.pow(2, depth - i) - 1);
            for (let j = 0; j < levelCount; ++j) {
                string += this.data[index].key;
                string += '#'.repeat(Math.pow(2, depth + 1 - i) - 1);
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
