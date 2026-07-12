// Dev utility: reset a user's password (and mark them verified) directly in
// the database. Needed for accounts created before the MVP verification
// bypass, whose owners can't receive reset emails at fake dev addresses.
//
// Usage (from server/):
//   node scripts/reset-password.js <email> <newPassword>
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env.local") });

// Same Windows SRV-lookup workaround as config/db.js.
const dns = require("dns");
dns.setServers([...dns.getServers(), "8.8.8.8", "8.8.4.4"]);

const mongoose = require("mongoose");
const { hashPassword } = require("../utils/password");

const [email, newPassword] = process.argv.slice(2);
if (!email || !newPassword) {
  console.error("Usage: node scripts/reset-password.js <email> <newPassword>");
  process.exit(1);
}
if (newPassword.length < 8) {
  console.error("Password must be at least 8 characters (login schema minimum).");
  process.exit(1);
}

(async () => {
  await mongoose.connect(process.env.MONGO_URL);
  const passwordHash = await hashPassword(newPassword);
  const result = await mongoose.connection.db.collection("users").updateOne(
    { email: email.toLowerCase().trim() },
    { $set: { passwordHash, isVerified: true } }
  );
  if (result.matchedCount === 0) {
    console.error(`No user found with email: ${email}`);
    process.exitCode = 1;
  } else {
    console.log(`Password updated for ${email}. You can log in with the new password now.`);
  }
  await mongoose.disconnect();
})().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
