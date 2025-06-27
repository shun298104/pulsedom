export class ContractionDetector {
  private vFireTimes: number[] = [];
  private ventricularFiringSet: Set<string> = new Set();
  private lastContractionTime: number = -3_000;
  private isContracting: boolean = false;
  private static MS_PER_MINUTE = 60000;
  private static DEFAULT_RR = 750;
  private ventricularNodes: Set<string>;

  constructor(ventricularNodes: Set<string>) {
    this.ventricularNodes = ventricularNodes;
  }

  update(firedNow: string[], currentTimeMs: number): boolean {
    for (const nodeId of firedNow) {
      if (this.ventricularNodes.has(nodeId)) {
        this.ventricularFiringSet.add(nodeId);
      }
    }
    if (this.ventricularFiringSet.size >= this.ventricularNodes.size) {
      this.ventricularFiringSet.clear();
      this.isContracting = true;
      this.lastContractionTime = currentTimeMs;
      this.vFireTimes.push(currentTimeMs);
      this.vFireTimes = this.vFireTimes.filter(ts => ts >= currentTimeMs - 5000);
      return true;
    }
    this.isContracting = false;
    return false;
  }

  isInContraction(): boolean {
    return this.isContracting;
  }

  getLastContractionTime(): number {
    return this.lastContractionTime;
  }

  getRR(): number {
    if (this.vFireTimes.length < 2) return ContractionDetector.DEFAULT_RR;
    const [prev, last] = this.vFireTimes.slice(-2);
    const rr = last - prev;
    return rr > 0 ? rr : ContractionDetector.DEFAULT_RR;
  }

  getHR(): number {
    if (this.vFireTimes.length < 2) return -1;
    const intervals = this.vFireTimes
      .slice(-6)
      .map((t, i, arr) => (i > 0 ? t - arr[i - 1] : 0))
      .filter(v => v > 0);
    if (intervals.length === 0) return -1;
    intervals.sort((a, b) => a - b);
    const median = intervals[Math.floor(intervals.length / 2)];
    return Math.round(ContractionDetector.MS_PER_MINUTE / median);
  }
}
