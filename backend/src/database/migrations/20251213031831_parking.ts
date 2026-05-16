import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable("parking", (table) => {
        table.increments("id").primary()
        table.string("parking_name", 255).notNullable()
        table.string("manager_name", 150).notNullable()
        table.timestamps(true, true)
    })
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTable("parking")
}

