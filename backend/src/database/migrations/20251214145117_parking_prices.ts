import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("parking_prices", (table) => {
    table.increments("id").primary()
    table
      .integer("parking_id")
      .notNullable()
      .references("id")
      .inTable("parking")
      .onDelete("CASCADE")
      .onUpdate("CASCADE")
    table.float("price_hour").notNullable()
    table.float("price_extra_hour").notNullable()
    table.float("daily_rate").notNullable()
    table.jsonb("night_period").notNullable()
    table.float("night_rate").notNullable()
    table.float("monthly_rate").notNullable()
    table.float("car_price").notNullable()
    table.float("moto_price").notNullable()
    table.float("truck_price").notNullable()
    table.timestamps(true, true)

    table.index("parking_id")
  })
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable("parking_prices")
}
