import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("vehicles", (table) => {
    table.increments("id").primary()
    table
      .integer("client_id")
      .notNullable()
      .references("id")
      .inTable("clients")
      .onDelete("CASCADE")
      .onUpdate("CASCADE")
    table.string("plate", 20).notNullable()
    table.integer("vehicle_type").notNullable().defaultTo(1)
    table.string("brand", 100).notNullable()
    table.string("color", 100).notNullable()
    table.timestamps(true, true)
    table.index("client_id")
  })
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable("vehicles")
}
