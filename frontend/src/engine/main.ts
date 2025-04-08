import { CardiacNode } from "./CardiacNode";

const dt = 10;
let t = 0;

const SA = new CardiacNode('SA', 75, 200);
const AV = new CardiacNode('AV', 50, 300);
const V = new CardiacNode('V', 30, 400);

function tick() {
  if (SA.shouldFire(t)) {
    SA.fire(t);
    AV.override(t);
    V.override(t);
  } else if (AV.shouldFire(t)) {
    AV.fire(t);
    V.override(t);
  } else if (V.shouldFire(t)) {
    V.fire(t);
  }

  t += dt;
  if (t < 10000) setTimeout(tick, dt);
}

tick();
