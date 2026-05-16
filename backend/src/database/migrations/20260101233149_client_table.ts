import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("clients", (table) => {
    table.increments("id").primary()    
    table.string("username", 255).notNullable()
    table.string("cpf", 11).notNullable()
    table.string("phone", 11).notNullable()
    table.string("email", 255).notNullable()
    table.integer("status").defaultTo(1)
    table.timestamps(true, true)
  })
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable("clients")
}
