/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
exports.shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @returns {Promise<void>}
 */
exports.up = async (pgm) => {
  pgm.createTable("exchange_rates", {
    id: { type: "serial", primaryKey: true },
    from_currency: { type: "varchar(3)", notNull: true },
    to_currency: { type: "varchar(3)", notNull: true },
    rate: { type: "numeric(14,6)", notNull: true },
    updated_at: { type: "timestamp", notNull: true, default: pgm.func("current_timestamp") },
  });

  pgm.addConstraint("exchange_rates", "exchange_rates_unique", {
    unique: ["from_currency", "to_currency"],
  });

  pgm.addConstraint("exchange_rates", "exchange_rates_rate_positive", {
    check: "rate > 0",
  });

  pgm.addConstraint("exchange_rates", "exchange_rates_distinct_currencies", {
    check: "from_currency <> to_currency",
  });

  // Insert default exchange rates (USD <-> GTQ)
  pgm.sql(`
    INSERT INTO exchange_rates (from_currency, to_currency, rate)
    VALUES 
      ('USD', 'GTQ', 7.75),
      ('GTQ', 'USD', 0.129032);
  `);
};

exports.down = async (pgm) => {
  pgm.dropTable("exchange_rates", { ifExists: true });
};
