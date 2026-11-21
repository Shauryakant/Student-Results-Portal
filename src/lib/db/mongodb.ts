import { MongoClient, Db } from 'mongodb';

const DEFAULT_DB_NAME = 'student_portal';

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

/**
 * Returns a cached MongoClient instance.
 * Throws a clear, informative error if MONGODB_URI is missing.
 */
export async function getMongoClient(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI;

  if (!uri || uri.trim() === '') {
    throw new Error(
      'Invalid/Missing environment variable: "MONGODB_URI". Please define MONGODB_URI in your environment or .env file.',
    );
  }

  if (process.env.NODE_ENV === 'development') {
    // In development mode, use a global variable so the client promise is preserved across HMR reloads
    if (!global._mongoClientPromise) {
      const client = new MongoClient(uri);
      global._mongoClientPromise = client.connect();
    }
    return global._mongoClientPromise;
  } else {
    // In production mode, cache on the module level or global
    if (!global._mongoClientPromise) {
      const client = new MongoClient(uri);
      global._mongoClientPromise = client.connect();
    }
    return global._mongoClientPromise;
  }
}

/**
 * Returns the MongoDB Database instance.
 * Defaults to MONGODB_DB env var or the default database in URI / 'student_portal'.
 */
export async function getDb(dbName?: string): Promise<Db> {
  const client = await getMongoClient();
  const targetDb = dbName || process.env.MONGODB_DB || DEFAULT_DB_NAME;
  return client.db(targetDb);
}

/**
 * Closes the cached MongoClient connection, primarily used for test cleanup.
 */
export async function closeMongoClient(): Promise<void> {
  if (global._mongoClientPromise) {
    const client = await global._mongoClientPromise;
    await client.close();
    global._mongoClientPromise = undefined;
  }
}

export const COLLECTIONS = {
  STUDENTS: 'students',
  IMPORTS: 'imports',
} as const;
