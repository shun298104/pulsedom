// src/engine/ECGBuffer.ts

export class ECGBuffer {
  private buffer: number[];
  private writeIndex: number;
  private readonly size: number;

  constructor({ size = 800 }: { size?: number }) {
    this.size = size;
    this.buffer = new Array(size).fill(0);
    this.writeIndex = 0;
  }

  // 新しい値を追加（リングバッファ）
  push(value: number) {
    this.buffer[this.writeIndex] = value;
    this.writeIndex = (this.writeIndex + 1) % this.size;
  }

  // 現在のバッファを並べ替えて返す（描画用）
  getArray(): number[] {
    const head = this.buffer.slice(this.writeIndex);
    const tail = this.buffer.slice(0, this.writeIndex);
    return [...head, ...tail];
  }

  // バッファサイズを取得
  getSize(): number {
    return this.size;
  }
}
