const REQUIRED = [
  'DATABASE_URL',
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
  'PHONE_HASH_KEY',
  'FIELD_ENCRYPTION_KEY',
] as const;

export function validateEnvironment(config: Record<string, unknown>): Record<string, unknown> {
  for (const name of REQUIRED) {
    const value = config[name];
    if (typeof value !== 'string' || value.trim().length === 0) {
      throw new Error(`Missing required environment variable: ${name}`);
    }
  }

  for (const name of ['JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET', 'PHONE_HASH_KEY'] as const) {
    if (String(config[name]).length < 32) {
      throw new Error(`${name} must contain at least 32 characters`);
    }
  }

  if (!/^[a-fA-F0-9]{64}$/.test(String(config.FIELD_ENCRYPTION_KEY))) {
    throw new Error('FIELD_ENCRYPTION_KEY must be a 64-character hexadecimal value');
  }

  const providerMode = String(config.PROVIDER_MODE ?? 'mock');
  if (!['mock', 'kuaidi100'].includes(providerMode)) {
    throw new Error('PROVIDER_MODE must be mock or kuaidi100');
  }

  if (providerMode === 'kuaidi100' && String(config.KUAIDI100_ENABLED) !== 'true') {
    throw new Error('KUAIDI100_ENABLED must be true before selecting the kuaidi100 provider');
  }

  return config;
}
