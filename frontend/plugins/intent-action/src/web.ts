import { WebPlugin } from '@capacitor/core';

import type { IntentActionPlugin } from './definitions';

export class IntentActionWeb extends WebPlugin implements IntentActionPlugin {
  async closeIntent(options: { value: any }): Promise<{ value: any }> {
    return options;
  }
}
