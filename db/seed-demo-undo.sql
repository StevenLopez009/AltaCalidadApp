-- ============================================================
-- DESHACER LOS DATOS DE DEMOSTRACIÓN
--
-- Ejecutar:
--   docker compose exec -T db mysql --default-character-set=utf8mb4 \
--     -uroot -p123456 altacalidad < db/seed-demo-undo.sql
--
-- Borra únicamente lo que creó db/seed-demo.sql, identificándolo
-- por nombre. Los datos propios no se tocan.
-- ============================================================

SET NAMES utf8mb4;

-- Pedidos que usan servicios o empresas del demo (con sus renglones y pagos).
CREATE TEMPORARY TABLE demo_orders AS
SELECT DISTINCT o.id
FROM orders o
LEFT JOIN order_items oi ON oi.order_id = o.id
LEFT JOIN services s ON s.id = oi.service_id
LEFT JOIN company c ON c.id = o.company_id
WHERE c.name_company IN (
        'Distribuciones El Progreso S.A.S','Supermercados La Sabana',
        'Constructora Madrid Ltda','Restaurante Doña Rosa',
        'Colegio San Agustín','Taller Automotriz Cundinamarca')
   OR o.customer_name IN (
        'María Fernanda Gutiérrez','Carlos Eduardo Peña','Sandra Milena Ortiz',
        'Diego Alejandro Rueda','Paola Andrea Numa')
   OR s.name IN (
        'Pendón publicitario','Pendón doble cara','Backing para eventos',
        'Aviso luminoso en acrílico','Valla publicitaria en ACM',
        'Señalización vial reflectiva','Rotulación vehicular','Vitrina esmerilada',
        'Adhesivos troquelados','Rompetráfico publicitario','Habladores de góndola',
        'Diseño de identidad visual','Retoque y montaje digital');

DELETE FROM order_payments WHERE order_id IN (SELECT id FROM demo_orders);
DELETE FROM order_items    WHERE order_id IN (SELECT id FROM demo_orders);
DELETE FROM orders         WHERE id       IN (SELECT id FROM demo_orders);

DROP TEMPORARY TABLE demo_orders;

DELETE FROM quotes WHERE customer_name IN (
  'Jorge Andrés Ramírez','Luz Marina Castro','Transportes Velázquez',
  'Tienda Mi Barrio','Panadería La Espiga');

-- Los adicionales caen solos al borrar el servicio (ON DELETE CASCADE),
-- pero se limpian los de servicios que no son del demo.
DELETE FROM service_addons WHERE name IN (
  'Ojales metálicos','Bastón y cuerda','Instalación',
  'Estructura tubular','Instalación en altura','Laminado de protección');

DELETE FROM services WHERE name IN (
  'Pendón publicitario','Pendón doble cara','Backing para eventos',
  'Aviso luminoso en acrílico','Valla publicitaria en ACM',
  'Señalización vial reflectiva','Rotulación vehicular','Vitrina esmerilada',
  'Adhesivos troquelados','Rompetráfico publicitario','Habladores de góndola',
  'Diseño de identidad visual','Retoque y montaje digital');

DELETE FROM materials WHERE name IN (
  'Lona banner 13 oz','Lona blackout doble cara','Vinilo adhesivo brillante',
  'Vinilo microperforado','Acrílico cristal 3 mm','Lámina ACM blanca',
  'Tinta ecosolvente CMYK','Tubo PVC estructural','Cartón corrugado impreso',
  'Papel fotográfico mate');

DELETE FROM company WHERE name_company IN (
  'Distribuciones El Progreso S.A.S','Supermercados La Sabana',
  'Constructora Madrid Ltda','Restaurante Doña Rosa',
  'Colegio San Agustín','Taller Automotriz Cundinamarca');

-- 'impresion-gran-formato' no se borra: es una categoría que ya existía
-- antes del demo y el seed solo le añadió imagen y descripción.
DELETE FROM categories WHERE slug IN (
  'avisos-y-senalizacion','vinilos-y-adhesivos','material-pop','diseno-grafico');

DELETE FROM header_carousel WHERE image_url IN (
  '/uploads/c44a2364-9385-438e-8d4b-6c9fc4f0b6a4.jpg',
  '/uploads/c8c86237-4a9c-4b01-8ee1-dc009d33acf5.jpg',
  '/uploads/d2399682-3300-4a85-ab52-cc0a0fe49024.jpg',
  '/uploads/e19d4b3d-17b1-4043-932a-13da1c556407.jpg');
