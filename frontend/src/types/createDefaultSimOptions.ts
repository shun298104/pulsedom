import { SimOptions } from './SimOptions';

export function createDefaultSimOptions(): SimOptions {
  return {
    hr: 60,
    spo2: 98,

    sinus: {
      rate: 60,
      status: 'normal',
      options: [],
    },

    junction: {
      rate: 40,
      status: 'normal',
      options: [],
      conductionRate: '1:1',
    },

    ventricle: {
      rate: 30,
      status: 'normal',
      ST_change: 'normal',
      options: [],
    },

    pacing: {
      mode: 'OFF',
      lowerRateLimit: 50,
      upperRateLimit: 120,
      avDelay: 120,
    },

    waveform: {
      mgnfy: 1.0,
      Pheight: 0.1,
      Pwidth: 0.08,
      Qdepth: -0.1,
      Rheight: 1.0,
      Sdepth: -0.15,
      Swidth: 0.08,
      Theight: 0.3,
      Twidth: 0.16,
      QRSwidth: 0.1,
      baseline: 0.0,
    },
  };
}
