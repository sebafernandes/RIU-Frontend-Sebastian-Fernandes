import { describe, expect, it } from 'vitest';
import { appConfig } from '@app/app.config';

describe('appConfig', () => {
  it('defines application providers', () => {
    expect(appConfig.providers?.length).toBeGreaterThan(0);
  });
});
