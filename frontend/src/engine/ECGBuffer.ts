// ECGBuffer.ts
export class ECGBuffer {
    private buffer: number[];
    private maxSize: number;
  
    constructor({ size = 800 }: { size?: number }) {
      this.maxSize = size;
      this.buffer = new Array(size).fill(0);
    }
  
    // 新しい電位を1つ追加（右端）
    push(value: number) {
      this.buffer.push(value);
      if (this.buffer.length > this.maxSize) {
        this.buffer.shift(); // 左端を削除（流れる）
      }
    }
  
    append(values: number[]) {
        for (const v of values) {
          this.push(v);
        }
      }

    // 現在のバッファ状態を配列で返す
    getArray(): number[] {
      return [...this.buffer];
    }
  
    // 全消去（リセット用）
    clear() {
      this.buffer = new Array(this.maxSize).fill(0);
    }
  }
  