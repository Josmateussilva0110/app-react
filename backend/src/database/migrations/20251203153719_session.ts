import type { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("session", table => {
    table.string("sid").primary()
    table.json("sess").notNullable()
    table.timestamp("expire", { useTz: true }).notNullable()
  })

  await knex.schema.alterTable("session", table => {
    table.index("expire", "IDX_session_expire")
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable("session")
}
