import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { getMongoClient, getDb, closeMongoClient } from './mongodb';

describe('MongoDB Connection Helper', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
    delete process.env.MONGODB_URI;
    delete process.env.MONGODB_DB;
  });

  afterEach(async () => {
    await closeMongoClient();
    process.env = originalEnv;
  });

  it('throws a clear error when MONGODB_URI is not set', async () => {
    await expect(getMongoClient()).rejects.toThrow(
      'Invalid/Missing environment variable: "MONGODB_URI"',
    );
  });

  it('throws a clear error when MONGODB_URI is empty whitespace', async () => {
    process.env.MONGODB_URI = '   ';
    await expect(getMongoClient()).rejects.toThrow(
      'Invalid/Missing environment variable: "MONGODB_URI"',
    );
  });

  it('provides getDb which also checks MONGODB_URI', async () => {
    await expect(getDb()).rejects.toThrow('Invalid/Missing environment variable: "MONGODB_URI"');
  });
});
