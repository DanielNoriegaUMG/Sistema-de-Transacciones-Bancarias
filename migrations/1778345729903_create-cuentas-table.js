/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
exports.shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @returns {Promise<void>}
 */
exports.up = async (pgm) => {
  pgm.createTable("users", {
    id: { type: "serial", primaryKey: true },
    username: { type: "varchar(50)", notNull: true },
    password_hash: { type: "varchar(255)", notNull: true },
    name: { type: "varchar(100)", notNull: true },
    email: { type: "varchar(100)", notNull: true },
    role: { type: "varchar(30)", notNull: true, default: "user" },
    created_at: { type: "timestamp", notNull: true, default: pgm.func("current_timestamp") },
    updated_at: { type: "timestamp", notNull: true, default: pgm.func("current_timestamp") },
  });

  pgm.addConstraint("users", "users_username_unique", { unique: ["username"] });
  pgm.addConstraint("users", "users_email_unique", { unique: ["email"] });

  pgm.createTable("cuentas", {
    id: { type: "serial", primaryKey: true },
    user_id: { type: "integer", notNull: true },
    account_number: { type: "varchar(24)", notNull: true },
    alias: { type: "varchar(50)" },
    balance: { type: "numeric(14,2)", notNull: true, default: "0.00" },
    currency: { type: "varchar(3)", notNull: true, default: "USD" },
    type: { type: "varchar(30)", notNull: true, default: "checking" },
    created_at: { type: "timestamp", notNull: true, default: pgm.func("current_timestamp") },
  });

  pgm.addConstraint("cuentas", "cuentas_user_id_fkey", {
    foreignKeys: [{ columns: "user_id", references: "users(id)", onDelete: "CASCADE" }],
  });
  pgm.addConstraint("cuentas", "cuentas_account_number_unique", { unique: ["account_number"] });

  pgm.createTable("estado_cuenta", {
    id: { type: "serial", primaryKey: true },
    cuenta_id: { type: "integer", notNull: true },
    amount: { type: "numeric(14,2)", notNull: true },
    type: { type: "varchar(10)", notNull: true },
    description: { type: "text" },
    balance_after: { type: "numeric(14,2)", notNull: true },
    created_at: { type: "timestamp", notNull: true, default: pgm.func("current_timestamp") },
  });

  pgm.addConstraint("estado_cuenta", "estado_cuenta_cuenta_id_fkey", {
    foreignKeys: [{ columns: "cuenta_id", references: "cuentas(id)", onDelete: "CASCADE" }],
  });

  pgm.createTable("transferencias", {
    id: { type: "serial", primaryKey: true },
    from_account_id: { type: "integer", notNull: true },
    to_account_id: { type: "integer", notNull: true },
    amount: { type: "numeric(14,2)", notNull: true },
    description: { type: "text" },
    status: { type: "varchar(20)", notNull: true, default: "completed" },
    created_at: { type: "timestamp", notNull: true, default: pgm.func("current_timestamp") },
  });

  pgm.addConstraint("transferencias", "transferencias_from_account_id_fkey", {
    foreignKeys: [{ columns: "from_account_id", references: "cuentas(id)", onDelete: "CASCADE" }],
  });

  pgm.addConstraint("transferencias", "transferencias_to_account_id_fkey", {
    foreignKeys: [{ columns: "to_account_id", references: "cuentas(id)", onDelete: "CASCADE" }],
  });

  pgm.addConstraint("transferencias", "transferencias_accounts_check", {
    check: "from_account_id <> to_account_id",
  });

  const adminPasswordHash = "$2b$10$XOgh07TjDoIWM5ZLDOqJRe32.2fgmF9jJNdJUI3irnk46uC0/IbOm";
  pgm.sql(
    `INSERT INTO users (username, password_hash, name, email, role)
     VALUES ('admin', '${adminPasswordHash}', 'Administrador', 'admin@banco.com', 'admin');`,
  );

  pgm.sql(
    `INSERT INTO cuentas (user_id, account_number, alias, balance, currency, type)
     VALUES (1, '1000100010001000', 'Cuenta principal', 10000.00, 'USD', 'checking');`,
  );
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @returns {Promise<void>}
 */
exports.down = async (pgm) => {
  pgm.dropTable("transferencias");
  pgm.dropTable("estado_cuenta");
  pgm.dropTable("cuentas");
  pgm.dropTable("users");
};
