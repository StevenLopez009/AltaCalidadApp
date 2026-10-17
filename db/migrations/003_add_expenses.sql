-- Ejecutar manualmente contra bases de datos existentes (el volumen de docker-compose
-- ya fue inicializado, por lo que db/init/01-schema.sql no se vuelve a correr).
CREATE TABLE IF NOT EXISTS expenses (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  description VARCHAR(160) NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  category ENUM(
    'arriendo',
    'servicios',
    'nomina',
    'materiales',
    'transporte',
    'mantenimiento',
    'impuestos',
    'otros'
  ) NOT NULL DEFAULT 'otros',
  payment_method ENUM('efectivo', 'digital') NOT NULL DEFAULT 'efectivo',
  spent_at DATE NOT NULL,
  notes VARCHAR(255) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_expenses_spent_at (spent_at),
  KEY idx_expenses_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
