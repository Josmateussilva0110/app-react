import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable("users", (table) => {
        table.increments("id").primary()
        table.string("username", 100).notNullable()
        table.string("email", 100).notNullable().unique()
        table.string("password", 255).notNullable()
        table.string("photo", 200).nullable()
        table.integer("status").defaultTo(1)
        table.timestamps(true, true)
    })
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTable("users")
}

