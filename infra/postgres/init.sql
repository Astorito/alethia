-- Alethia — Inicializacion de PostgreSQL
-- Este archivo se ejecuta automaticamente al crear el container.
-- Docker ejecuta todos los archivos .sql en orden alfanumérico:
--   01-init.sql  → este archivo (solo extensiones globales)
--   02-schema.sql → tablas principales
--   03-migration-001.sql → tablas de comisiones, ejecutivo, declaraciones

CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pg_trgm;
