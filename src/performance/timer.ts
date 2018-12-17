export default class Timer {
    samples: number[];
    repeats: number;
    constructor(measurementRepeats: number) {
        this.repeats =  measurementRepeats;
        this.samples = [];
    }

    runTest(func: () => void): number {
        let sum = 0;
        let iters = 0;
        while (iters < this.repeats) {
            const oldTime = Date.now();
            func();
            const newTime = Date.now();
            sum += newTime - oldTime;
            iters += 1;
        }
        const avg = sum / this.repeats;
        this.samples.push(avg);
        return avg;
    }
    toString(): string {
        let retString = '';
        this.samples.forEach((sample) => (retString += sample.toString() + ', '));
        return retString + '\n';
    }
}
