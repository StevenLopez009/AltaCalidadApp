-- Admin inicial. Usuario: admin / Contraseña: Admin123*
INSERT INTO admins (username, password)
VALUES (
  'admin',
  '$2b$12$Y1K8csKhol5pSkrEXnPL7.B9Fo2W7CP2t.XkpV6ZH28oGtKOyythW'
)
ON DUPLICATE KEY UPDATE username = username;

-- Título del encabezado, editable desde el panel de administración.
INSERT INTO site_settings (setting_key, setting_value)
VALUES ('hero_title', 'Creamos.\nProducimos.\nEntregamos.')
ON DUPLICATE KEY UPDATE setting_key = setting_key;
