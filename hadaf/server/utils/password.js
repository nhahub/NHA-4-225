// Pure-JS bcrypt via `bcryptjs` — no native compile step, works on free-tier
// hosts that don't expose node-gyp build chains. API surface is the same as
// `bcrypt`: hash(password, rounds) and compare(plain, hash).
const bcrypt = require("bcryptjs");

/**
 * Hashes a plaintext password using bcrypt with a salt cost of 10.
 * @param {string} password
 * @returns {Promise<string>} The hashed password
 */
exports.hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

/**
 * Compares a plaintext password against a hashed password.
 * @param {string} password
 * @param {string} passwordHash
 * @returns {Promise<boolean>} True if they match, false otherwise
 */
exports.comparePassword = async (password, passwordHash) => {
  return await bcrypt.compare(password, passwordHash);
};