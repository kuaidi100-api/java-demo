import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';

describe('AppController', () => {
  it('returns the health result from the service', async () => {
    const result = { status: 'ok', database: 'ok', providerMode: 'mock', mockEnvironment: true };
    const service = { health: vi.fn().mockResolvedValue(result) } as unknown as AppService;
    const controller = new AppController(service);

    await expect(controller.health()).resolves.toEqual(result);
  });
});
