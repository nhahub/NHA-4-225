// DB connection — three modes:
//   1. MONGO_URL set + reachable  → connect to Atlas / external Mongo
//   2. USE_MEMORY_DB=1            → in-process MongoDB (mongodb-memory-server)
//   3. neither                    → fail fast (require one of the above)
//
// Mode 2 is the dev escape hatch — Atlas IP whitelisting was blocking local
// development, so we spin up a real mongod binary in-process (cached in
// node_modules/.cache/mongodb-memory-server after first install).
//
// The Mongo native resolver on Windows can't do SRV lookups reliably, so
// Google's DNS is appended to the OS resolver as a fallback.
const dns = require("dns");
const mongoose = require("mongoose");

dns.setServers([...dns.getServers(), "8.8.8.8", "8.8.4.4"]);

const MONGO_TIMEOUT_MS = Number(process.env.MONGO_TIMEOUT_MS) || 30000;

async function connectAtlas(mongoUrl) {
  const startedAt = Date.now();
  try {
    await mongoose.connect(mongoUrl, {
      serverSelectionTimeoutMS: MONGO_TIMEOUT_MS,
    });
    console.log(`[db] Atlas connected in ${Date.now() - startedAt}ms`);
    return true;
  } catch (err) {
    console.error(`[db] Atlas connection failed after ${Date.now() - startedAt}ms: ${err.message}`);
    return false;
  }
}

async function connectMemory() {
  // Dynamic import — only loaded when actually needed (dev convenience,
  // not bundled into prod runtime path).
  const { MongoMemoryServer } = require("mongodb-memory-server");
  const startedAt = Date.now();
  const mem = await MongoMemoryServer.create({
    instance: { dbName: "hadaf" },
  });
  const uri = mem.getUri();
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: MONGO_TIMEOUT_MS,
  });
  console.log(`[db] in-memory MongoDB started in ${Date.now() - startedAt}ms at ${uri}`);
  // Stash the server on the mongoose connection so app shutdown can stop it.
  mongoose.connection.once("close", () => mem.stop());
  return true;
}

const connectdb = async () => {
  const mongoUrl = process.env.MONGO_URL;

  // Explicit in-memory override always wins.
  if (process.env.USE_MEMORY_DB === "1") {
    return connectMemory();
  }

  if (mongoUrl && mongoUrl.trim().length > 0) {
    const ok = await connectAtlas(mongoUrl);
    if (ok) return;
    console.error(
      "[db] MONGO_URL is set but unreachable. Set USE_MEMORY_DB=1 to " +
        "spin up an in-process MongoDB, or fix your Atlas IP whitelist."
    );
  }

  // Last resort: try the in-memory server even when MONGO_URL is missing,
  // so the dev workflow doesn't break just because someone forgot to copy
  // .env.example. Clearly labelled.
  console.warn("[db] MONGO_URL missing — falling back to in-memory MongoDB.");
  return connectMemory();
};

module.exports = connectdb;