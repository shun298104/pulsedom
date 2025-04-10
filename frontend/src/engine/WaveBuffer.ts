export class WaveBuffer {
  private buffer: number[];
  private pointer: number;
  private size: number;

  constructor({ size = 2000 }: { size?: number }) {
    this.size = size;
    this.buffer = new Array(size).fill(0);
    this.pointer = 0;
  }

  // 新しい値を追加
  push(value: number) {
    this.buffer[this.pointer] = value;
    this.pointer = (this.pointer + 1) % this.size;
  }

  // 最新値（最後にpushされた値）を取得
  getLatest(): number {
    const latestIndex = (this.pointer - 1 + this.size) % this.size;
    return this.buffer[latestIndex];
  }

  // 最新のn個を取得（古い順）
  getLatestN(n: number): number[] {
    const result: number[] = [];
    for (let i = 0; i < n; i++) {
      const index = (this.pointer - n + i + this.size) % this.size;
      result.push(this.buffer[index]);
    }
    return result;
  }

  // 全体を古い順に整列して返す（ライブウィンドウ用など）
  getArray(): number[] {
    return [
      ...this.buffer.slice(this.pointer),
      ...this.buffer.slice(0, this.pointer),
    ];
  }

  // バッファを初期化
  clear() {
    this.buffer.fill(0);
    this.pointer = 0;
  }
}
