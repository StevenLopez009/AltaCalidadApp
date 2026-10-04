-- Ejecutar manualmente contra bases de datos existentes (el volumen de docker-compose
-- ya fue inicializado, por lo que db/init/01-schema.sql no se vuelve a correr).
ALTER TABLE order_payments
  ADD COLUMN receipt_file VARCHAR(255) NULL AFTER digital_provider;
