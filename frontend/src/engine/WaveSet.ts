// src/engine/WaveSet.ts
export class WaveSet {
    private buffers: Map<string, number[]>;
    private size: number;
    private pointer: number;
  
    constructor(signals: string[], size: number) {
      this.size = size;
      this.pointer = 0;
      this.buffers = new Map();
      signals.forEach(signal => {
        this.buffers.set(signal, new Array(size).fill(0));
      });
    }
  
    push(values: { [key: string]: number }) {
      this.buffers.forEach((arr, key) => {
        arr[this.pointer] = values[key] ?? 0;
      });
      this.pointer = (this.pointer + 1) % this.size;
    }
  
    getArray(signal: string): number[] {
      const arr = this.buffers.get(signal);
      if (!arr) return [];
      const first = arr.slice(this.pointer);
      const second = arr.slice(0, this.pointer);
      return [...first, ...second];
    }
    getRenderableArray(key: string): number[] {
      const buffer = this.buffers.get(key);
      if (!buffer) return [];
    
      // pointerの位置から末尾＋先頭をつなげて並べ替える
      return buffer.slice(this.pointer).concat(buffer.slice(0, this.pointer));
    }
  }
  