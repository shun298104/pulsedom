// src/rules/generators/customHandlers.ts
import { updateGraphWithAfCustomArgs } from './AfCustomRule';
//import { updateGraphWithAflCustomArgs } from './AflCustomRule';

export const handlerMap = {
  Af: updateGraphWithAfCustomArgs,
//  Afl: updateGraphWithAflCustomArgs,
  // ...ほかに増やすだけ！
};