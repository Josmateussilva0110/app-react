import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("parking_operations", (table) => {
    table.increments("id").primary()
    table
      .integer("parking_id")
      .notNullable()
      .references("id")
      .inTable("parking")
      .onDelete("CASCADE")
      .onUpdate("CASCADE")
    table.integer("total_spots").notNullable()
    table.integer("car_spots").notNullable()
    table.integer("moto_spots").nullable()
    table.integer("truck_spots").nullable()
    table.integer("pcd_spots").nullable()
    table.integer("elderly_spots").nullable()
    table.boolean("has_cameras").defaultTo(false)
    table.boolean("has_washing").defaultTo(false)
    table.integer("area_type").notNullable()
    table.timestamps(true, true)

    table.index("parking_id")
  })
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable("parking_operations")
}
