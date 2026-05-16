import type { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable("parking", (table) => {
    table
      .integer("created_by")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("users")
      .onUpdate("CASCADE")
      .onDelete("CASCADE")
  })
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable("parking", (table) => {
    table.dropColumn("created_by")
  })
}
