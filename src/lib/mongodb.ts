import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Please define MONGODB_URI in .env.local");
}

const mongoUri: string = MONGODB_URI;

type CachedMongoose = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

const globalWithMongoose = global as typeof globalThis & {
  mongooseCache?: CachedMongoose;
};

const cached =
  globalWithMongoose.mongooseCache ||
  (globalWithMongoose.mongooseCache = {
    conn: null,
    promise: null,
  });

export async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(mongoUri, {
      maxPoolSize: 20,
      minPoolSize: 5,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      retryWrites: true,
    });
  }

  cached.conn = await cached.promise;

  if (process.env.NODE_ENV === "development") {
    console.log("✅ MongoDB Connected");
  }

  return cached.conn;
}