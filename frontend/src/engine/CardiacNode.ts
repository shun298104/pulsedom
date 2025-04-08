// CardiacNode.ts
export class CardiacNode {
    constructor(public name: string, public rate: number, public refractory: number) {
      this.nextFire = 0;
      this.lastFire = -Infinity;
    }
  
    nextFire: number;
    lastFire: number;
  
    shouldFire(now: number): boolean {
      return now >= this.nextFire && (now - this.lastFire) >= this.refractory;
    }
  
    fire(now: number): void {
      this.lastFire = now;
      this.nextFire = now + 60000 / this.rate;
      console.log(`${this.name} fired at ${now}ms`);
    }
  
    override(now: number): void {
      this.nextFire = now + 60000 / this.rate;
    }
  }
  