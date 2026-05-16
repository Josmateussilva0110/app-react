import type { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable("allocations", (table) => {
    table
      .string("payment_type", 10).notNullable()
  })
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable("allocations", (table) => {
    table.dropColumn("payment_type")
  })
}
