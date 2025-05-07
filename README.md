
# PULSEDOM: Graph Control Rule System

This document describes the internal architecture of the GraphControlRule system in the PULSEDOM ECG simulation engine.

---

## 🧠 Overview

PULSEDOM uses a **declarative rule-based system** to control the behavior of nodes and paths in the cardiac conduction network, based on the current simulation statuses.

Control rules are defined in `src/rules/GraphControlRule.ts` and are centrally applied by the `GraphEngine` based on the derived `SimOptions.statuses()`.

---

## 📊 Structure of a Control Rule

Each rule is an object with the following fields:

```ts
type GraphControlRule = {
  when: Record<string, string>;        // Conditions matched against SimOptions
  apply: {
    node?: Record<NodeId, NodeEffect>;
    path?: Record<PathId, PathEffect>;
  };
  group?: GraphControlGroup;           // For UI layout
  exclusiveGroup?: string;             // Used to enforce mutual exclusivity
};
```

---

## ⚙️ NodeEffect / PathEffect

### NodeEffect (partial settings):

```ts
{
  autofire: boolean;
  rate: number;
  refractory: number;
  'ectopic.enabled': boolean;
  'ectopic.probability': number;
  'burst.maxCount': number;
}
```

### PathEffect (partial settings):

```ts
{
  block: boolean;
  delayMs: number;
  refractoryMs: number;
  delayJitterMs: number;
  amplitude: number;
  probability: number;
}
```

---

## 🔀 Rule Grouping

### `group`
Used for logical UI groupings like `"AtrialStatus"`, `"VentricularArrhythmia"`, `"Pacing"`, etc.

### `exclusiveGroup`
Used to ensure only one rule is active at a time within a category.
e.g. `'AtrialControl'` → only one of `Af`, `AFL`, `SinusStop` can be active at a time.

---

## 🧩 SimOptions → statuses[]

The `SimOptions.getStatuses()` method dynamically generates a status list like:

```ts
['Af', 'SinusStop']
```

Rules are triggered based on whether their `when` clause matches any of these statuses.

---

## 💡 Example Rule

```ts
{
  when: { sinus: 'stopped' },
  apply: {
    node: {
      SA: { autofire: false },
      IA: { autofire: false }
    }
  },
  group: 'AtrialStatus',
  exclusiveGroup: 'AtrialControl'
}
```

---

## 🔮 Future Directions

- Introduce `"Normal"` rules for resetting each category (Atrial, Ventricular, Pacing)
- Auto-generate UI from GraphControlRule structure
- i18n support for status and group labels
- Link logging/debug to each rule’s application

---

