/**
* Implements simple minheap priority queue for the Dijkstra algorithm.
*/
class minHeap {
    class Entry {
        key: number;
        value: number;
    }
    data: Array<Entry>;
    
    constructor() {
        this.data = new Array<Entry>();
    }
    siftUp(index: number): void {
        let parentindex = Math.floor(index/2) - 1;
        if(array[parentindex].key > array[index].key) {
            Swap(parentindex, index);
            if(parentindex > 0)
            {
                siftUp(parentindex);
            }
        }
        
    }
    siftDown(index: number): void {
        let leftChild = 2*index + 1;
        let rightChild = leftchild + 1;
        if(data[index].key > data[leftChild].key || data[index].key > data[rightChild].key) {
            let minChild = (data[leftChild].key < data[rightChild].key)? leftchild : rightchild;
            Swap(minChild, index);
            if(minChild != data.length - 1) {
                siftDown(minChild);
            }
        }
    }
    push(key: number, value: number): void {
        let lastIndex = data.length;
        data.push({key, value});
        siftUp(lastIndex);
    }
    pop(): Entry {
        swap(0, data.length - 1);
        let returnEntry = data.pop();
        siftDown(0);
        
    }
    swap(index1, index2): void {
        let temp = array[index1];
        array[index1] = array[index2];
        array[index2] = temp;
    }
}