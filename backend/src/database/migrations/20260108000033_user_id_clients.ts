import type { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable("clients", (table) => {
    table
      .integer("user_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("users")
      .onUpdate("CASCADE")
      .onDelete("CASCADE")
  })
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable("clients", (table) => {
    table.dropColumn("user_id")
  })
}
