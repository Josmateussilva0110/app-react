import type { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("allocations", (table) => {
    table.increments("id").primary()

    table
      .integer("parking_id")
      .notNullable()
      .references("id")
      .inTable("parking")
      .onDelete("CASCADE")
      .onUpdate("CASCADE")

    table
      .integer("client_id")
      .notNullable()
      .references("id")
      .inTable("clients")
      .onDelete("CASCADE")
      .onUpdate("CASCADE")

    table
      .integer("vehicle_id")
      .notNullable()
      .references("id")
      .inTable("vehicles")
      .onDelete("CASCADE")
      .onUpdate("CASCADE")

    table
      .tinyint("vehicle_type")
      .notNullable()
      .defaultTo(1)

    table.dateTime("entry_date")
    table.text("observations")

    table.timestamps(true, true)

    table.index(["parking_id"])
    table.index(["client_id"])
    table.index(["vehicle_id"])
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable("allocations")
}
