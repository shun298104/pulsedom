import { SimOptions } from '../types/SimOptions';

/**
 * SimOptions を base64 + URIエンコードで URL パラメータ化
 */
export function encodeSimOptionsToURL(simOptions: SimOptions): string {
  try {
    const raw = simOptions.getRaw();
    const json = JSON.stringify(raw);
    return encodeURIComponent(btoa(json));
  } catch (e) {
    console.error("encodeSimOptionsToURL failed", e);
    return '';
  }
}

/**
 * URL パラメータから SimOptions を復元
 */
export function decodeSimOptionsFromURL(encoded: string): SimOptions | null {
  try {
    const json = atob(decodeURIComponent(encoded));
    const raw = JSON.parse(json);
    const sim = new SimOptions(raw);
    if (raw.status) sim['status'] = raw.status;
    return sim;
  } catch (e) {
    console.error("decodeSimOptionsFromURL failed", e);
    return null;
  }
}