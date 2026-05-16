import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("parking_prices", (table) => {
    table.jsonb("night_period").nullable().alter();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("parking_prices", (table) => {
    table.jsonb("night_period").notNullable().alter();
  });
}