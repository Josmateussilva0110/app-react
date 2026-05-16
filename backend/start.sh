#!/bin/sh
set -e

DB_HOST=db

echo "Aguardando o PostgreSQL em $DB_HOST..."

until pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER"; do
  sleep 2
done

echo "PostgreSQL pronto 🚀"

echo "Rodando migrations..."
npx knex migrate:latest --env development

echo "Iniciando servidor..."

exec npm run dev
