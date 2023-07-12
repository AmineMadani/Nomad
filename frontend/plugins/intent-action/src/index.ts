import { registerPlugin } from '@capacitor/core';

import type { IntentActionPlugin } from './definitions';

const IntentAction = registerPlugin<IntentActionPlugin>('IntentAction', {
  web: () => import('./web').then(m => new m.IntentActionWeb()),
});

export * from './definitions';
export { IntentAction };
