import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("parking_address", (table) => {
    table.increments("id").primary()
    table
      .integer("parking_id")
      .notNullable()
      .references("id")
      .inTable("parking")
      .onDelete("CASCADE")
      .onUpdate("CASCADE")
    table.string("street", 255).notNullable()
    table.integer("number").notNullable()
    table.string("complement", 255)
    table.string("district", 255).notNullable()
    table.string("city", 200).notNullable()
    table.string("state", 2).notNullable()
    table.string("zip_code", 20).notNullable()

    table.timestamps(true, true)

    table.index("parking_id")
  })
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable("parking_address")
}
