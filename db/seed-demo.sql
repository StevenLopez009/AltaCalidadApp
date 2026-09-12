-- ============================================================
-- DATOS DE DEMOSTRACIÓN
--
-- Ejecutar:
--   docker compose exec -T db mysql --default-character-set=utf8mb4 \
--     -uroot -p123456 altacalidad < db/seed-demo.sql
--
-- Para borrarlos: db/seed-demo-undo.sql
--
-- Las fechas son relativas a la fecha de ejecución, así que el
-- calendario y los reportes siempre muestran actividad reciente.
-- ============================================================

SET NAMES utf8mb4;

-- ------------------------------------------------------------
-- CATEGORÍAS
-- ------------------------------------------------------------

INSERT INTO categories (name, description, image, slug) VALUES
 ('Impresión gran formato', 'Pendones, banners y backings impresos en alta resolución para interiores y exteriores.', '/uploads/1268e7c4-a354-4d40-b355-165bb91aa2b7.jpg', 'impresion-gran-formato'),
 ('Avisos y señalización', 'Avisos luminosos, vallas y señalización normativa para empresas y locales comerciales.', '/uploads/17a11161-2a92-47f0-a883-cffcdbc76f14.jpg', 'avisos-y-senalizacion'),
 ('Vinilos y adhesivos', 'Rotulación vehicular, vitrinas esmeriladas y adhesivos de corte.', '/uploads/1e3866ac-b464-42ea-80bd-0e25848f905e.jpg', 'vinilos-y-adhesivos'),
 ('Material POP', 'Rompetráficos, habladores y material publicitario para punto de venta.', '/uploads/26101e6c-9c19-4369-8a0d-8064ab2b1cff.jpg', 'material-pop'),
 ('Diseño gráfico', 'Diseño de identidad visual, piezas publicitarias y retoque digital.', '/uploads/30231dc8-e9e5-47df-a4bc-97f7fd405d92.jpg', 'diseno-grafico')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  image = VALUES(image);

-- ------------------------------------------------------------
-- MATERIALES  (algunos por debajo del mínimo, para ver alertas)
-- ------------------------------------------------------------

INSERT INTO materials (category_id, name, description, unit, stock, minimum_stock, unit_cost) VALUES
 ((SELECT id FROM categories WHERE slug='impresion-gran-formato'), 'Lona banner 13 oz', 'Rollo de lona para exteriores, acabado mate.', 'm2', 420, 80, 8500),
 ((SELECT id FROM categories WHERE slug='impresion-gran-formato'), 'Lona blackout doble cara', 'Lona opaca para pendones a doble cara.', 'm2', 62, 80, 14200),
 ((SELECT id FROM categories WHERE slug='vinilos-y-adhesivos'), 'Vinilo adhesivo brillante', 'Vinilo de corte y full color para interiores.', 'm2', 250, 60, 12000),
 ((SELECT id FROM categories WHERE slug='vinilos-y-adhesivos'), 'Vinilo microperforado', 'Vinilo para vidrios con visión unidireccional.', 'm2', 34, 50, 18900),
 ((SELECT id FROM categories WHERE slug='avisos-y-senalizacion'), 'Acrílico cristal 3 mm', 'Lámina de acrílico transparente para avisos.', 'm2', 96, 20, 47000),
 ((SELECT id FROM categories WHERE slug='avisos-y-senalizacion'), 'Lámina ACM blanca', 'Panel compuesto de aluminio para fachadas.', 'm2', 41, 15, 62000),
 ((SELECT id FROM categories WHERE slug='impresion-gran-formato'), 'Tinta ecosolvente CMYK', 'Set de tintas para plotter ecosolvente.', 'litro', 26, 10, 155000),
 ((SELECT id FROM categories WHERE slug='avisos-y-senalizacion'), 'Tubo PVC estructural', 'Tubería para estructuras de pendones y avisos.', 'metro', 180, 60, 9800),
 ((SELECT id FROM categories WHERE slug='material-pop'), 'Cartón corrugado impreso', 'Base para rompetráficos y habladores.', 'unidad', 310, 90, 4200),
 ((SELECT id FROM categories WHERE slug='material-pop'), 'Papel fotográfico mate', 'Papel de alto gramaje para piezas POP.', 'm2', 11, 25, 21000);

-- ------------------------------------------------------------
-- SERVICIOS
-- ------------------------------------------------------------

INSERT INTO services (category_id, material_id, name, description, unit, price, image) VALUES
 ((SELECT id FROM categories WHERE slug='impresion-gran-formato'), (SELECT id FROM materials WHERE name='Lona banner 13 oz'), 'Pendón publicitario', 'Impresión full color en lona 13 oz con bastón y cuerda.', 'm2', 45000, '/uploads/32baabe1-1ad7-4502-98e7-f55966229786.jpg'),
 ((SELECT id FROM categories WHERE slug='impresion-gran-formato'), (SELECT id FROM materials WHERE name='Lona blackout doble cara'), 'Pendón doble cara', 'Pendón en lona blackout impreso por ambas caras.', 'm2', 78000, '/uploads/3a8047ad-2fba-4128-bcc7-5948e2415b50.jpg'),
 ((SELECT id FROM categories WHERE slug='impresion-gran-formato'), (SELECT id FROM materials WHERE name='Lona banner 13 oz'), 'Backing para eventos', 'Fondo fotográfico con estructura tubular.', 'm2', 96000, '/uploads/444e2c55-ec8c-458d-a6a8-18094f00f9ac.jpg'),
 ((SELECT id FROM categories WHERE slug='avisos-y-senalizacion'), (SELECT id FROM materials WHERE name='Acrílico cristal 3 mm'), 'Aviso luminoso en acrílico', 'Aviso con iluminación LED y acrílico cristal.', 'unidad', 480000, '/uploads/73a4dc72-3549-45c3-8e8c-dc5f8980f31d.jpg'),
 ((SELECT id FROM categories WHERE slug='avisos-y-senalizacion'), (SELECT id FROM materials WHERE name='Lámina ACM blanca'), 'Valla publicitaria en ACM', 'Valla en lámina ACM con impresión directa.', 'm2', 132000, '/uploads/782f5085-138a-424c-84ad-f48b169c5f26.jpg'),
 ((SELECT id FROM categories WHERE slug='avisos-y-senalizacion'), (SELECT id FROM materials WHERE name='Tubo PVC estructural'), 'Señalización vial reflectiva', 'Señales normativas con lámina reflectiva.', 'metro', 68000, '/uploads/7d2ea310-419e-4b08-b9d3-f5a3330df13b.jpg'),
 ((SELECT id FROM categories WHERE slug='vinilos-y-adhesivos'), (SELECT id FROM materials WHERE name='Vinilo adhesivo brillante'), 'Rotulación vehicular', 'Vinilo de corte aplicado sobre vehículos.', 'm2', 89000, '/uploads/800c89f5-2682-4aae-b875-4dc9c5b54f82.jpg'),
 ((SELECT id FROM categories WHERE slug='vinilos-y-adhesivos'), (SELECT id FROM materials WHERE name='Vinilo microperforado'), 'Vitrina esmerilada', 'Vinilo esmerilado para vidrios de oficina.', 'm2', 62000, '/uploads/835fc999-7e8e-4615-b7c3-ea0ccfd26df0.jpg'),
 ((SELECT id FROM categories WHERE slug='vinilos-y-adhesivos'), (SELECT id FROM materials WHERE name='Vinilo adhesivo brillante'), 'Adhesivos troquelados', 'Stickers de corte por lote.', 'unidad', 3500, '/uploads/8863f6df-4ad0-4951-9221-c639d364da0b.jpg'),
 ((SELECT id FROM categories WHERE slug='material-pop'), (SELECT id FROM materials WHERE name='Cartón corrugado impreso'), 'Rompetráfico publicitario', 'Display de piso para punto de venta.', 'unidad', 78000, '/uploads/a8c39549-f03a-4354-8d2a-7be9a163b366.jpg'),
 ((SELECT id FROM categories WHERE slug='material-pop'), (SELECT id FROM materials WHERE name='Papel fotográfico mate'), 'Habladores de góndola', 'Piezas pequeñas para estantería.', 'unidad', 9500, '/uploads/a98d84b7-cac3-421f-8740-9d1599514d5c.jpg'),
 ((SELECT id FROM categories WHERE slug='diseno-grafico'), NULL, 'Diseño de identidad visual', 'Logotipo, paleta y manual básico de marca.', 'unidad', 650000, '/uploads/aeae7755-afc8-48ef-88c3-03eda9b6f41a.jpg'),
 ((SELECT id FROM categories WHERE slug='diseno-grafico'), NULL, 'Retoque y montaje digital', 'Ajuste de piezas gráficas por tiempo de trabajo.', 'minuto', 1200, '/uploads/b40c2558-53f0-4992-8af5-e0f1eaf7c669.jpg');

-- ------------------------------------------------------------
-- ADICIONALES DE SERVICIOS
-- ------------------------------------------------------------

INSERT INTO service_addons (service_id, name, price) VALUES
 ((SELECT id FROM services WHERE name='Pendón publicitario'), 'Ojales metálicos', 1500),
 ((SELECT id FROM services WHERE name='Pendón publicitario'), 'Bastón y cuerda', 12000),
 ((SELECT id FROM services WHERE name='Pendón publicitario'), 'Instalación', 45000),
 ((SELECT id FROM services WHERE name='Backing para eventos'), 'Estructura tubular', 85000),
 ((SELECT id FROM services WHERE name='Valla publicitaria en ACM'), 'Instalación en altura', 120000),
 ((SELECT id FROM services WHERE name='Rotulación vehicular'), 'Laminado de protección', 28000);

-- ------------------------------------------------------------
-- EMPRESAS
-- ------------------------------------------------------------

INSERT INTO company (name_company, telefono, discount_percentage) VALUES
 ('Distribuciones El Progreso S.A.S', '3009998877', 12),
 ('Supermercados La Sabana', '3124455667', 8),
 ('Constructora Madrid Ltda', '3157788990', 15),
 ('Restaurante Doña Rosa', '3201122334', 5),
 ('Colegio San Agustín', '3013344556', 10),
 ('Taller Automotriz Cundinamarca', '3186677889', 0);

-- ------------------------------------------------------------
-- CARRUSEL DEL ENCABEZADO
-- ------------------------------------------------------------

INSERT INTO header_carousel (image_url, sort_order, active) VALUES
 ('/uploads/c44a2364-9385-438e-8d4b-6c9fc4f0b6a4.jpg', 0, TRUE),
 ('/uploads/c8c86237-4a9c-4b01-8ee1-dc009d33acf5.jpg', 1, TRUE),
 ('/uploads/d2399682-3300-4a85-ab52-cc0a0fe49024.jpg', 2, TRUE),
 ('/uploads/e19d4b3d-17b1-4043-932a-13da1c556407.jpg', 3, TRUE);

-- ------------------------------------------------------------
-- COTIZACIONES
-- ------------------------------------------------------------

INSERT INTO quotes (service_id, code, customer_name, phone, email, city, address, quantity, unit, unit_price, total, observations, created_at) VALUES
 ((SELECT id FROM services WHERE name='Pendón publicitario'), CONCAT('AC-', DATE_FORMAT(CURDATE(), '%Y%m%d'), '-A1B2'), 'Jorge Andrés Ramírez', '3105558899', 'jorge.ramirez@correo.com', 'Madrid', 'Calle 5 # 12-40', 4, 'm2', 45000, 180000, 'Necesita entrega para feria empresarial.', DATE_SUB(NOW(), INTERVAL 9 DAY)),
 ((SELECT id FROM services WHERE name='Aviso luminoso en acrílico'), CONCAT('AC-', DATE_FORMAT(CURDATE(), '%Y%m%d'), '-C3D4'), 'Luz Marina Castro', '3132244556', 'luzm.castro@correo.com', 'Funza', 'Carrera 9 # 3-21', 1, 'unidad', 480000, 480000, 'Solicita visita técnica previa.', DATE_SUB(NOW(), INTERVAL 6 DAY)),
 ((SELECT id FROM services WHERE name='Rotulación vehicular'), CONCAT('AC-', DATE_FORMAT(CURDATE(), '%Y%m%d'), '-E5F6'), 'Transportes Velázquez', '3169988774', 'contacto@tvelazquez.com', 'Mosquera', 'Zona Industrial bodega 7', 12, 'm2', 89000, 1068000, 'Flota de 3 camionetas.', DATE_SUB(NOW(), INTERVAL 3 DAY)),
 ((SELECT id FROM services WHERE name='Habladores de góndola'), CONCAT('AC-', DATE_FORMAT(CURDATE(), '%Y%m%d'), '-G7H8'), 'Tienda Mi Barrio', '3024455661', NULL, 'Madrid', 'Calle 8 # 2-15', 150, 'unidad', 9500, 1425000, NULL, DATE_SUB(NOW(), INTERVAL 1 DAY)),
 ((SELECT id FROM services WHERE name='Diseño de identidad visual'), CONCAT('AC-', DATE_FORMAT(CURDATE(), '%Y%m%d'), '-I9J0'), 'Panadería La Espiga', '3117766554', 'laespiga@correo.com', 'Madrid', 'Carrera 6 # 10-08', 1, 'unidad', 650000, 650000, 'Quiere propuesta con 3 opciones.', NOW());

-- ------------------------------------------------------------
-- PEDIDOS
-- Los totales se calculan más abajo a partir de los renglones.
-- ------------------------------------------------------------

INSERT INTO orders (company_id, customer_type, customer_name, customer_phone, delivery_date, status, observations, subtotal, discount_percentage, discount_amount, total, created_at) VALUES
 ((SELECT id FROM company WHERE name_company='Distribuciones El Progreso S.A.S'), 'empresa', NULL, NULL, DATE_SUB(CURDATE(), INTERVAL 24 DAY), 'entregado', 'Entrega en bodega principal.', 0,12,0,0, DATE_SUB(NOW(), INTERVAL 30 DAY)),
 ((SELECT id FROM company WHERE name_company='Supermercados La Sabana'), 'empresa', NULL, NULL, DATE_SUB(CURDATE(), INTERVAL 18 DAY), 'entregado', NULL, 0,8,0,0, DATE_SUB(NOW(), INTERVAL 23 DAY)),
 (NULL, 'usuario', 'María Fernanda Gutiérrez', '3105554433', DATE_SUB(CURDATE(), INTERVAL 14 DAY), 'entregado', NULL, 0,0,0,0, DATE_SUB(NOW(), INTERVAL 19 DAY)),
 ((SELECT id FROM company WHERE name_company='Constructora Madrid Ltda'), 'empresa', NULL, NULL, DATE_SUB(CURDATE(), INTERVAL 9 DAY), 'entregado', 'Instalación incluida en obra.', 0,15,0,0, DATE_SUB(NOW(), INTERVAL 15 DAY)),
 ((SELECT id FROM company WHERE name_company='Colegio San Agustín'), 'empresa', NULL, NULL, DATE_SUB(CURDATE(), INTERVAL 5 DAY), 'terminado', 'Pendiente de recoger en sede.', 0,10,0,0, DATE_SUB(NOW(), INTERVAL 11 DAY)),
 (NULL, 'usuario', 'Carlos Eduardo Peña', '3143322110', DATE_SUB(CURDATE(), INTERVAL 2 DAY), 'terminado', NULL, 0,0,0,0, DATE_SUB(NOW(), INTERVAL 7 DAY)),
 ((SELECT id FROM company WHERE name_company='Restaurante Doña Rosa'), 'empresa', NULL, NULL, CURDATE(), 'en_produccion', 'Cambio de imagen del local.', 0,5,0,0, DATE_SUB(NOW(), INTERVAL 5 DAY)),
 (NULL, 'usuario', 'Sandra Milena Ortiz', '3198877665', CURDATE(), 'pendiente', 'Confirmar color antes de imprimir.', 0,0,0,0, DATE_SUB(NOW(), INTERVAL 3 DAY)),
 ((SELECT id FROM company WHERE name_company='Taller Automotriz Cundinamarca'), 'empresa', NULL, NULL, CURDATE(), 'pendiente', NULL, 0,0,0,0, DATE_SUB(NOW(), INTERVAL 2 DAY)),
 ((SELECT id FROM company WHERE name_company='Supermercados La Sabana'), 'empresa', NULL, NULL, DATE_ADD(CURDATE(), INTERVAL 1 DAY), 'en_produccion', 'Material POP para temporada.', 0,8,0,0, DATE_SUB(NOW(), INTERVAL 4 DAY)),
 (NULL, 'usuario', 'Diego Alejandro Rueda', '3167788221', DATE_ADD(CURDATE(), INTERVAL 3 DAY), 'pendiente', NULL, 0,0,0,0, DATE_SUB(NOW(), INTERVAL 1 DAY)),
 ((SELECT id FROM company WHERE name_company='Constructora Madrid Ltda'), 'empresa', NULL, NULL, DATE_ADD(CURDATE(), INTERVAL 6 DAY), 'pendiente', 'Señalización para nueva obra.', 0,15,0,0, NOW()),
 ((SELECT id FROM company WHERE name_company='Distribuciones El Progreso S.A.S'), 'empresa', NULL, NULL, DATE_ADD(CURDATE(), INTERVAL 9 DAY), 'pendiente', NULL, 0,12,0,0, NOW()),
 (NULL, 'usuario', 'Paola Andrea Numa', '3011199887', DATE_ADD(CURDATE(), INTERVAL 12 DAY), 'pendiente', 'Pedido para apertura de local.', 0,0,0,0, NOW()),
 ((SELECT id FROM company WHERE name_company='Colegio San Agustín'), 'empresa', NULL, NULL, DATE_SUB(CURDATE(), INTERVAL 12 DAY), 'cancelado', 'El cliente desistió del pedido.', 0,10,0,0, DATE_SUB(NOW(), INTERVAL 16 DAY));

-- ------------------------------------------------------------
-- RENGLONES DE LOS PEDIDOS
-- Se usa @o para tomar el pedido por su posición desde el final.
-- ------------------------------------------------------------

SET @base = (SELECT MAX(id) FROM orders) - 14;

INSERT INTO order_items (order_id, category_id, service_id, quantity, width, height, unit, unit_price, subtotal, observations) VALUES
 (@base+0, (SELECT category_id FROM services WHERE name='Pendón publicitario'), (SELECT id FROM services WHERE name='Pendón publicitario'), 6, 1.20, 2.00, 'm2', 45000, 0, 'Pendones para puntos de venta'),
 (@base+0, (SELECT category_id FROM services WHERE name='Adhesivos troquelados'), (SELECT id FROM services WHERE name='Adhesivos troquelados'), 500, NULL, NULL, 'unidad', 3500, 0, NULL),

 (@base+1, (SELECT category_id FROM services WHERE name='Rompetráfico publicitario'), (SELECT id FROM services WHERE name='Rompetráfico publicitario'), 15, NULL, NULL, 'unidad', 78000, 0, NULL),
 (@base+1, (SELECT category_id FROM services WHERE name='Habladores de góndola'), (SELECT id FROM services WHERE name='Habladores de góndola'), 200, NULL, NULL, 'unidad', 9500, 0, NULL),

 (@base+2, (SELECT category_id FROM services WHERE name='Pendón publicitario'), (SELECT id FROM services WHERE name='Pendón publicitario'), 2, 1.00, 1.50, 'm2', 45000, 0, NULL),

 (@base+3, (SELECT category_id FROM services WHERE name='Valla publicitaria en ACM'), (SELECT id FROM services WHERE name='Valla publicitaria en ACM'), 1, 4.00, 3.00, 'm2', 132000, 0, 'Valla de obra'),
 (@base+3, (SELECT category_id FROM services WHERE name='Señalización vial reflectiva'), (SELECT id FROM services WHERE name='Señalización vial reflectiva'), 8, 1.20, NULL, 'metro', 68000, 0, NULL),

 (@base+4, (SELECT category_id FROM services WHERE name='Backing para eventos'), (SELECT id FROM services WHERE name='Backing para eventos'), 1, 3.00, 2.40, 'm2', 96000, 0, 'Backing de grados'),
 (@base+4, (SELECT category_id FROM services WHERE name='Pendón publicitario'), (SELECT id FROM services WHERE name='Pendón publicitario'), 4, 0.90, 1.80, 'm2', 45000, 0, NULL),

 (@base+5, (SELECT category_id FROM services WHERE name='Vitrina esmerilada'), (SELECT id FROM services WHERE name='Vitrina esmerilada'), 1, 2.50, 1.80, 'm2', 62000, 0, NULL),

 (@base+6, (SELECT category_id FROM services WHERE name='Aviso luminoso en acrílico'), (SELECT id FROM services WHERE name='Aviso luminoso en acrílico'), 1, NULL, NULL, 'unidad', 480000, 0, 'Aviso de fachada'),
 (@base+6, (SELECT category_id FROM services WHERE name='Vitrina esmerilada'), (SELECT id FROM services WHERE name='Vitrina esmerilada'), 1, 3.00, 1.20, 'm2', 62000, 0, NULL),

 (@base+7, (SELECT category_id FROM services WHERE name='Pendón publicitario'), (SELECT id FROM services WHERE name='Pendón publicitario'), 1, 1.00, 2.00, 'm2', 45000, 0, 'Medida pequeña'),
 (@base+7, (SELECT category_id FROM services WHERE name='Pendón publicitario'), (SELECT id FROM services WHERE name='Pendón publicitario'), 1, 2.00, 3.00, 'm2', 45000, 0, 'Medida grande, mismo diseño'),

 (@base+8, (SELECT category_id FROM services WHERE name='Rotulación vehicular'), (SELECT id FROM services WHERE name='Rotulación vehicular'), 1, 4.50, 1.60, 'm2', 89000, 0, 'Camioneta del taller'),

 (@base+9, (SELECT category_id FROM services WHERE name='Rompetráfico publicitario'), (SELECT id FROM services WHERE name='Rompetráfico publicitario'), 25, NULL, NULL, 'unidad', 78000, 0, NULL),
 (@base+9, (SELECT category_id FROM services WHERE name='Habladores de góndola'), (SELECT id FROM services WHERE name='Habladores de góndola'), 350, NULL, NULL, 'unidad', 9500, 0, NULL),

 (@base+10, (SELECT category_id FROM services WHERE name='Diseño de identidad visual'), (SELECT id FROM services WHERE name='Diseño de identidad visual'), 1, NULL, NULL, 'unidad', 650000, 0, NULL),
 (@base+10, (SELECT category_id FROM services WHERE name='Retoque y montaje digital'), (SELECT id FROM services WHERE name='Retoque y montaje digital'), 90, NULL, NULL, 'minuto', 1200, 0, 'Ajustes de piezas'),

 (@base+11, (SELECT category_id FROM services WHERE name='Señalización vial reflectiva'), (SELECT id FROM services WHERE name='Señalización vial reflectiva'), 14, 1.50, NULL, 'metro', 68000, 0, NULL),

 (@base+12, (SELECT category_id FROM services WHERE name='Pendón doble cara'), (SELECT id FROM services WHERE name='Pendón doble cara'), 3, 1.00, 2.20, 'm2', 78000, 0, NULL),
 (@base+12, (SELECT category_id FROM services WHERE name='Adhesivos troquelados'), (SELECT id FROM services WHERE name='Adhesivos troquelados'), 800, NULL, NULL, 'unidad', 3500, 0, NULL),

 (@base+13, (SELECT category_id FROM services WHERE name='Backing para eventos'), (SELECT id FROM services WHERE name='Backing para eventos'), 1, 2.50, 2.00, 'm2', 96000, 0, 'Apertura de local'),
 (@base+13, (SELECT category_id FROM services WHERE name='Rompetráfico publicitario'), (SELECT id FROM services WHERE name='Rompetráfico publicitario'), 4, NULL, NULL, 'unidad', 78000, 0, NULL),

 (@base+14, (SELECT category_id FROM services WHERE name='Pendón publicitario'), (SELECT id FROM services WHERE name='Pendón publicitario'), 5, 1.00, 2.00, 'm2', 45000, 0, NULL);

-- ------------------------------------------------------------
-- CÁLCULO DE IMPORTES
-- ------------------------------------------------------------

-- Subtotal de cada renglón según la unidad del servicio.
UPDATE order_items
SET subtotal = ROUND(
  CASE unit
    WHEN 'm2'    THEN COALESCE(width,0) * COALESCE(height,0) * quantity * unit_price
    WHEN 'metro' THEN COALESCE(width,0) * quantity * unit_price
    ELSE quantity * unit_price
  END, 2)
WHERE order_id >= @base;

-- Totales del pedido a partir de sus renglones.
UPDATE orders o
SET o.subtotal = COALESCE((SELECT SUM(oi.subtotal) FROM order_items oi WHERE oi.order_id = o.id), 0)
WHERE o.id >= @base;

UPDATE orders
SET discount_amount = ROUND(subtotal * discount_percentage / 100, 2),
    total = ROUND(subtotal - (subtotal * discount_percentage / 100), 2)
WHERE id >= @base;

-- ------------------------------------------------------------
-- PAGOS
-- Repartidos por día y método para alimentar el panel de finanzas.
-- ------------------------------------------------------------

INSERT INTO order_payments (order_id, amount, payment_method, paid_at) VALUES
 (@base+0,  ROUND((SELECT total FROM orders WHERE id=@base+0) * 0.5, 2), 'efectivo', DATE_SUB(NOW(), INTERVAL 29 DAY)),
 (@base+0,  ROUND((SELECT total FROM orders WHERE id=@base+0) * 0.5, 2), 'digital',  DATE_SUB(NOW(), INTERVAL 24 DAY)),
 (@base+1,  (SELECT total FROM orders WHERE id=@base+1),                 'digital',  DATE_SUB(NOW(), INTERVAL 21 DAY)),
 (@base+2,  (SELECT total FROM orders WHERE id=@base+2),                 'efectivo', DATE_SUB(NOW(), INTERVAL 17 DAY)),
 (@base+3,  ROUND((SELECT total FROM orders WHERE id=@base+3) * 0.6, 2), 'digital',  DATE_SUB(NOW(), INTERVAL 14 DAY)),
 (@base+3,  ROUND((SELECT total FROM orders WHERE id=@base+3) * 0.4, 2), 'efectivo', DATE_SUB(NOW(), INTERVAL 9 DAY)),
 (@base+4,  ROUND((SELECT total FROM orders WHERE id=@base+4) * 0.5, 2), 'efectivo', DATE_SUB(NOW(), INTERVAL 10 DAY)),
 (@base+5,  (SELECT total FROM orders WHERE id=@base+5),                 'efectivo', DATE_SUB(NOW(), INTERVAL 6 DAY)),
 (@base+6,  ROUND((SELECT total FROM orders WHERE id=@base+6) * 0.4, 2), 'digital',  DATE_SUB(NOW(), INTERVAL 5 DAY)),
 (@base+7,  ROUND((SELECT total FROM orders WHERE id=@base+7) * 0.5, 2), 'efectivo', DATE_SUB(NOW(), INTERVAL 3 DAY)),
 (@base+9,  ROUND((SELECT total FROM orders WHERE id=@base+9) * 0.3, 2), 'digital',  DATE_SUB(NOW(), INTERVAL 2 DAY)),
 (@base+10, ROUND((SELECT total FROM orders WHERE id=@base+10) * 0.5, 2),'digital',  DATE_SUB(NOW(), INTERVAL 1 DAY)),
 (@base+12, ROUND((SELECT total FROM orders WHERE id=@base+12) * 0.3, 2),'efectivo', NOW()),
 (@base+13, ROUND((SELECT total FROM orders WHERE id=@base+13) * 0.5, 2),'digital',  NOW());

-- Estado de pago derivado de lo efectivamente abonado.
UPDATE orders o
SET o.amount_paid = COALESCE((SELECT SUM(p.amount) FROM order_payments p WHERE p.order_id = o.id), 0)
WHERE o.id >= @base;

UPDATE orders
SET payment_status = CASE
  WHEN amount_paid <= 0 THEN 'pendiente'
  WHEN amount_paid >= total THEN 'pagado'
  ELSE 'pago_parcial'
END
WHERE id >= @base;
