import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongod;

/** Starts an in-memory MongoDB and connects mongoose to it. Call from `beforeAll`. */
export async function startTestDb() {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());

  // Schema indexes (including partial-unique ones like Allocation's
  // active-allocation guard) are built asynchronously in the background
  // after connect — tests that check index-enforced behavior need them to
  // actually exist first, so wait for every already-registered model here.
  await Promise.all(Object.values(mongoose.connection.models).map((model) => model.init()));
}

/** Call from `afterAll`. */
export async function stopTestDb() {
  await mongoose.disconnect();
  if (mongod) await mongod.stop();
}

/** Call from `afterEach` to isolate tests from each other. */
export async function clearTestDb() {
  const collections = mongoose.connection.collections;
  for (const key of Object.keys(collections)) {
    await collections[key].deleteMany({});
  }
}
