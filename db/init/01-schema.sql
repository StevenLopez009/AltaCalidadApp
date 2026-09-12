SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS categories (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  description TEXT NULL,
  image VARCHAR(500) NULL,
  slug VARCHAR(150) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_categories_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS materials (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  category_id INT UNSIGNED NULL,
  name VARCHAR(150) NOT NULL,
  description TEXT NULL,
  unit VARCHAR(20) NOT NULL,
  stock DECIMAL(12, 2) NOT NULL DEFAULT 0,
  minimum_stock DECIMAL(12, 2) NOT NULL DEFAULT 0,
  unit_cost DECIMAL(12, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_materials_category (category_id),
  CONSTRAINT fk_materials_category FOREIGN KEY (category_id)
    REFERENCES categories (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS services (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  category_id INT UNSIGNED NOT NULL,
  material_id INT UNSIGNED NULL,
  -- Material consumido por cada unidad cobrada. Permite que un servicio
  -- cobrado por unidad gaste una fracción de un material medido en m2.
  material_usage DECIMAL(12, 4) NOT NULL DEFAULT 1,
  name VARCHAR(150) NOT NULL,
  description TEXT NULL,
  unit VARCHAR(20) NOT NULL,
  price DECIMAL(12, 2) NOT NULL DEFAULT 0,
  image VARCHAR(500) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_services_category (category_id),
  KEY idx_services_material (material_id),
  CONSTRAINT fk_services_category FOREIGN KEY (category_id)
    REFERENCES categories (id) ON DELETE CASCADE,
  CONSTRAINT fk_services_material FOREIGN KEY (material_id)
    REFERENCES materials (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS company (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name_company VARCHAR(180) NOT NULL,
  telefono VARCHAR(30) NULL,
  discount_percentage DECIMAL(5, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS orders (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  company_id INT UNSIGNED NULL,
  customer_type ENUM('empresa', 'usuario') NOT NULL DEFAULT 'empresa',
  customer_name VARCHAR(180) NULL,
  customer_phone VARCHAR(30) NULL,
  delivery_date DATE NOT NULL,
  status ENUM('pendiente', 'en_produccion', 'terminado', 'entregado', 'cancelado')
    NOT NULL DEFAULT 'pendiente',
  payment_status ENUM('pendiente', 'pago_parcial', 'pagado')
    NOT NULL DEFAULT 'pendiente',
  amount_paid DECIMAL(12, 2) NOT NULL DEFAULT 0,
  subtotal DECIMAL(12, 2) NOT NULL DEFAULT 0,
  discount_percentage DECIMAL(5, 2) NOT NULL DEFAULT 0,
  discount_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
  total DECIMAL(12, 2) NOT NULL DEFAULT 0,
  design_file VARCHAR(500) NULL,
  observations TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_orders_company (company_id),
  KEY idx_orders_delivery_date (delivery_date),
  KEY idx_orders_status (status),
  CONSTRAINT fk_orders_company FOREIGN KEY (company_id)
    REFERENCES company (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS order_items (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id INT UNSIGNED NOT NULL,
  category_id INT UNSIGNED NULL,
  service_id INT UNSIGNED NULL,
  quantity DECIMAL(12, 2) NOT NULL DEFAULT 1,
  width DECIMAL(12, 2) NULL,
  height DECIMAL(12, 2) NULL,
  unit VARCHAR(20) NULL,
  unit_price DECIMAL(12, 2) NOT NULL DEFAULT 0,
  subtotal DECIMAL(12, 2) NOT NULL DEFAULT 0,
  design_file VARCHAR(500) NULL,
  observations TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_order_items_order (order_id),
  KEY idx_order_items_service (service_id),
  CONSTRAINT fk_order_items_order FOREIGN KEY (order_id)
    REFERENCES orders (id) ON DELETE CASCADE,
  CONSTRAINT fk_order_items_category FOREIGN KEY (category_id)
    REFERENCES categories (id) ON DELETE SET NULL,
  CONSTRAINT fk_order_items_service FOREIGN KEY (service_id)
    REFERENCES services (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS service_addons (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  service_id INT UNSIGNED NOT NULL,
  name VARCHAR(120) NOT NULL,
  price DECIMAL(12, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_service_addons_service (service_id),
  CONSTRAINT fk_service_addons_service FOREIGN KEY (service_id)
    REFERENCES services (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Adicionales elegidos en un renglón. Guarda nombre y precio del momento
-- para que el histórico no cambie si luego se edita o borra el adicional.
CREATE TABLE IF NOT EXISTS order_item_addons (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_item_id INT UNSIGNED NOT NULL,
  addon_id INT UNSIGNED NULL,
  name VARCHAR(120) NOT NULL,
  unit_price DECIMAL(12, 2) NOT NULL DEFAULT 0,
  quantity DECIMAL(12, 2) NOT NULL DEFAULT 1,
  subtotal DECIMAL(12, 2) NOT NULL DEFAULT 0,
  KEY idx_order_item_addons_item (order_item_id),
  CONSTRAINT fk_order_item_addons_item FOREIGN KEY (order_item_id)
    REFERENCES order_items (id) ON DELETE CASCADE,
  CONSTRAINT fk_order_item_addons_addon FOREIGN KEY (addon_id)
    REFERENCES service_addons (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS order_payments (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id INT UNSIGNED NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  payment_method ENUM('efectivo', 'digital') NOT NULL DEFAULT 'efectivo',
  notes VARCHAR(255) NULL,
  paid_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_order_payments_order (order_id),
  KEY idx_order_payments_paid_at (paid_at),
  KEY idx_order_payments_method (payment_method),
  CONSTRAINT fk_order_payments_order FOREIGN KEY (order_id)
    REFERENCES orders (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS quotes (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  service_id INT UNSIGNED NULL,
  code VARCHAR(40) NOT NULL,
  customer_name VARCHAR(180) NOT NULL,
  phone VARCHAR(30) NOT NULL,
  email VARCHAR(180) NULL,
  city VARCHAR(120) NULL,
  address VARCHAR(255) NULL,
  quantity DECIMAL(12, 2) NOT NULL DEFAULT 1,
  unit VARCHAR(20) NULL,
  unit_price DECIMAL(12, 2) NOT NULL DEFAULT 0,
  total DECIMAL(12, 2) NOT NULL DEFAULT 0,
  observations TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_quotes_code (code),
  KEY idx_quotes_service (service_id),
  CONSTRAINT fk_quotes_service FOREIGN KEY (service_id)
    REFERENCES services (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS admins (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(80) NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_admins_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS site_settings (
  setting_key VARCHAR(60) NOT NULL PRIMARY KEY,
  setting_value TEXT NOT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Imágenes de la sección Portafolio de la página pública.
CREATE TABLE IF NOT EXISTS portfolio_images (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  image_url VARCHAR(500) NOT NULL,
  title VARCHAR(120) NULL,
  sort_order INT NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_portfolio_order (sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS header_carousel (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  image_url VARCHAR(500) NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_header_carousel_order (sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
