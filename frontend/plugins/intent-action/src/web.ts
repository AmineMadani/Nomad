import { WebPlugin } from '@capacitor/core';

import type { IntentActionPlugin } from './definitions';

export class IntentActionWeb extends WebPlugin implements IntentActionPlugin {
  async echo(options: { value: string }): Promise<{ value: string }> {
    console.log('ECHO', options);
    return options;
  }
}
