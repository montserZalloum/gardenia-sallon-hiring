import { MongoClient, type Db } from "mongodb";

const uri = process.env.MONGODB_URI ?? "mongodb://localhost:27017";
const dbName = process.env.MONGODB_DB ?? "gardenia";

declare global {
  var __gardeniaMongoClient: MongoClient | undefined;
  var __gardeniaMongoPromise: Promise<MongoClient> | undefined;
}

function getClientPromise(): Promise<MongoClient> {
  if (!globalThis.__gardeniaMongoPromise) {
    const client = new MongoClient(uri);
    globalThis.__gardeniaMongoClient = client;
    globalThis.__gardeniaMongoPromise = client.connect();
  }
  return globalThis.__gardeniaMongoPromise;
}

export async function getDb(): Promise<Db> {
  const client = await getClientPromise();
  return client.db(dbName);
}

export async function ensureIndexes(): Promise<void> {
  const db = await getDb();
  await Promise.all([
    db.collection("jobs").createIndex({ expiryDate: 1 }),
    db.collection("applications").createIndex({ jobId: 1 }),
    db.collection("applications").createIndex({ submittedAt: -1 }),
  ]);
}
