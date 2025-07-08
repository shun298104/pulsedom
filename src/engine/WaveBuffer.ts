// src/engine/WaveBuffer.ts

export class WaveBuffer {
  private buffer: number[];
  private sizeLimit: number;

  constructor(size: number = 2000) {
    this.buffer = [];
    this.sizeLimit = size;
  }

  push(val: number) {
    this.buffer.push(val);
    if (this.buffer.length > this.sizeLimit) {
      this.buffer.shift();
    }
  }

  getArray() {
    return this.buffer;
  }

  toArray(): number[] {
    return Array.from(this.buffer);
  }

  size() {
    return this.buffer.length;
  }

  fromArray(arr: number[]) {
    // インスタンスメソッド：既存インスタンスに配列をセット
    this.buffer = Array.isArray(arr) ? arr.slice() : [];
  }

  static fromArray(arr: number[]): WaveBuffer {
    // クラスメソッド：新規インスタンスに配列をセットして返す
    const wb = new WaveBuffer();
    wb.fromArray(arr);
    return wb;
  }

  static fromBufferMap(obj: Record<string, number[]>): Record<string, WaveBuffer> {
    // 複数バッファ一括変換
    const result: Record<string, WaveBuffer> = {};
    for (const key in obj) {
      if (Array.isArray(obj[key])) {
        result[key] = WaveBuffer.fromArray(obj[key]);
      }
    }
    return result;
  }
}

export type WaveBufferMap = Record<string, WaveBuffer>;
