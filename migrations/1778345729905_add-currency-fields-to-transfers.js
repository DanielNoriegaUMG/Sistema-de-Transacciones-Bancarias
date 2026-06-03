/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
exports.shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @returns {Promise<void>}
 */
exports.up = async (pgm) => {
  pgm.addColumns("transferencias", {
    from_currency: { type: "varchar(3)", notNull: true, default: "USD" },
    to_currency: { type: "varchar(3)", notNull: true, default: "USD" },
    exchange_rate: { type: "numeric(14,6)", notNull: true, default: 1 },
    amount_received: { type: "numeric(14,2)", notNull: true, default: "0.00" },
  });

  pgm.sql(`
    UPDATE transferencias
    SET amount_received = amount
    WHERE amount_received = 0.00;
  `);
};

exports.down = async (pgm) => {
  pgm.dropColumns("transferencias", ["from_currency", "to_currency", "exchange_rate", "amount_received"]);
};
