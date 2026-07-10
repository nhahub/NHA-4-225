const dns = require("dns");
const mongoose = require("mongoose");

// The local/OS resolver can't do SRV lookups on some networks (observed on
// Windows dev machines), which breaks mongodb+srv:// connection strings with
// `querySrv ECONNREFUSED`. Google's DNS resolves them fine, so prefer it
// ahead of whatever the OS provides.
dns.setServers([...dns.getServers(), "8.8.8.8", "8.8.4.4"]);

const connectdb = async () => {
  if (!process.env.MONGO_URL) {
    console.error("MONGO_URL is missing from environment variables");
    process.exit(1);
  }

  const startedAt = Date.now();
  const mongoTimeoutMs = Number(process.env.MONGO_TIMEOUT_MS) || 30000;

  try {
    await mongoose.connect(process.env.MONGO_URL, {
      serverSelectionTimeoutMS: mongoTimeoutMs,
    });

    console.log(`DB connected in ${Date.now() - startedAt}ms`);
  } catch (error) {
    console.error(`DB connection failed after ${Date.now() - startedAt}ms`);
    console.error(error.message);
    process.exit(1);
  }
};

module.exports = connectdb;
