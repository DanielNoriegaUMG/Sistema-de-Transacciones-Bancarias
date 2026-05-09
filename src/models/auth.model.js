const pool = require("../config/db");

const findByUsername = async (username) => {
  const result = await pool.query(
    `SELECT id, username, password_hash, name, email, role FROM users WHERE username = $1`,
    [username],
  );
  return result.rows[0] || null;
};

module.exports = {
  findByUsername,
};

