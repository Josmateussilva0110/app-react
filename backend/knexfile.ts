import type { Knex } from "knex"
import dotenv from "dotenv"
import path from "path"

dotenv.config({
  path: path.resolve(__dirname, "../.env"),
})


function requiredEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Environment variable ${name} is required`)
  }
  return value
}

const sharedConfig: Partial<Knex.Config> = {
  client: "pg",
  pool: {
    min: 2,
    max: 10,
  },
}

const config: { [key: string]: Knex.Config } = {
  development: {
    ...sharedConfig,
    connection: {
      host: requiredEnv("DB_HOST"),
      port: Number(requiredEnv("DB_PORT")),
      user: requiredEnv("DB_USER"),
      password: requiredEnv("DB_PASSWORD"),
      database: requiredEnv("DB_DATABASE"),
    },
    migrations: {
      directory: "./src/database/migrations",
      extension: "ts",
    },
    seeds: {
      directory: "./src/database/seeds",
      extension: "ts",
    },
  },

  production: {
    ...sharedConfig,
    connection: {
      host: requiredEnv("DB_HOST"),
      port: Number(requiredEnv("DB_PORT")),
      user: requiredEnv("DB_USER"),
      password: requiredEnv("DB_PASSWORD"),
      database: requiredEnv("DB_DATABASE"),
      ssl: { rejectUnauthorized: false },
    },
    migrations: {
      directory: "./dist/database/migrations",
      extension: "js",
    },
    seeds: {
      directory: "./dist/database/seeds",
      extension: "js",
    },
  },
}

export default config
