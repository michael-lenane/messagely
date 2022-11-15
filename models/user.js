const db = require("../db");

/** User class for message.ly */

const { BCRYPT_WORK_FACTOR, DB_URI } = require("../config");
const ExpressError = require("../expressError");

/** User of the site. */

class User {
  /** register new user -- returns
   *    {username, password, first_name, last_name, phone}
   */

  static async register({ username, password, first_name, last_name, phone }) {
    const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);
    const user = await db.query(
      `
        INSERT INTO users (username, password, first_name, last_name, phone)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING username, password, first_name, last_name, phone
        `,
      [username, hashedPassword, first_name, last_name, phone]
    );
    if (user) {
      return user.rows[0];
    }
    return new ExpressError("Password not authorized", 404);
  }

  /** Authenticate: is this username/password valid? Returns boolean. */

  static async authenticate(username, password) {
    const result = await db.query(
      "SELECT password FROM users WHERE username = $1",
      [username]
    );
    let user = result.rows[0];

    if (user) {
      if ((await bcrypt.compare(password, user.password)) === true) {
        let token = jwt.sign({ username }, SECRET_KEY);
        return res.json({ token });
      }
    }
    throw new ExpressError("Invalid user/password", 400);
  }

  /** Update last_login_at for user */

  static async updateLoginTimestamp(username) {
    const result = await db.query(
      `
        UPDATE users
        SET last_login_at = CURRENT_TIMESTAMP
        WHERE username = $1
        RETURNING username, last_login_at
        `,
      [username]
    );
    if (result) {
      return result.rows[0];
    }
    return new ExpressError("User not found", 404);
  }

  /** All: basic info on all users:
   * [{username, first_name, last_name, phone}, ...] */

  static async all() {
    const users = await db.query(`
      SELECT username, first_name, last_name, phone
      FROM users
      RETURNING username, first_name, last_name, phone
      `);
    const userInfo = { users };
    return userInfo;
  }

  /** Get: get user by username
   *
   * returns {username,
   *          first_name,
   *          last_name,
   *          phone,
   *          join_at,
   *          last_login_at } */

  static async get(username) {
    const result = await db.query(
      `
    SELECT username, first_name, last_name, phone, join_at, last_login_at
    FROM users
    WHERE username = $1
    RETURNING username, first_name, last_name, phone, join_at, last_login_at`,
      [username]
    );
    if (result) {
      return result.rows[0];
    }
    return new ExpressError("Username not found", 404);
  }

  /** Return messages from this user.
   *
   * [{id, to_user, body, sent_at, read_at}]
   *
   * where to_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesFrom(username) {}

  /** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesTo(username) {}
}

module.exports = User;
