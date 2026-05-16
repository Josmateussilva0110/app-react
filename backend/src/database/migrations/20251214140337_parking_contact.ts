import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("parking_contact", (table) => {
    table.increments("id").primary()
    table
      .integer("parking_id")
      .notNullable()
      .references("id")
      .inTable("parking")
      .onDelete("CASCADE")
      .onUpdate("CASCADE")
    table.string("phone", 11).notNullable()
    table.string("whatsapp", 11).notNullable()
    table.string("email", 255).notNullable().unique()
    table.jsonb("open_hours").notNullable()
    table.timestamps(true, true)

    table.index("parking_id")
  })
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable("parking_contact")
}
