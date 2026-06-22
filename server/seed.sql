INSERT INTO users (name, email, password, role, cargo) VALUES
('Admin Municipio Plaza', 'admin@municipioplaza.gob.ve', '$2a$10$hmSxN9ZLtt2lRL7fjpfM8.hyp2jJzVNAhY/Os8UwGYtQTQwomyU1u', 'admin', 'Alcalde'),
('Maria Rodriguez', 'obras@municipioplaza.gob.ve', '$2a$10$hmSxN9ZLtt2lRL7fjpfM8.hyp2jJzVNAhY/Os8UwGYtQTQwomyU1u', 'admin', 'Directora de Obras Publicas'),
('Carlos Mendoza', 'contratista1@email.com', '$2a$10$aCSUnzGNsqCjB8pj5E6NmuL55Y3prWA3SLEgMxOyZRJbsXwurSg..', 'contractor', 'Ingeniero Civil'),
('Ana Pereira', 'contratista2@email.com', '$2a$10$aCSUnzGNsqCjB8pj5E6NmuL55Y3prWA3SLEgMxOyZRJbsXwurSg..', 'contractor', 'Arquitecto'),
('Visitante', 'visitante@email.com', '$2a$10$hg8IZWe.Q0NaB3mkAtghpO21XE5OERUXk4j3Ok7orMUwfUvZ79ENC', 'viewer', 'Ciudadano');

INSERT INTO contractors (user_id, company_name, rif, phone, address) VALUES
(3, 'Constructora Bolivar C.A.', 'J-12345678-9', '0212-5550101', 'Av. Principal, Zona Industrial, Guarenas'),
(4, 'Vialca C.A.', 'J-87654321-0', '0212-5550202', 'Calle 5, Los Dos Caminos, Caracas');

INSERT INTO projects (name, description, location, budget, start_date, end_date, status, contractor_id) VALUES
('Pavimentacion Av. Bolivar', 'Pavimentacion completa de la Avenida Bolivar desde la Plaza hasta el Puente', 'Av. Bolivar, Guarenas', 2500000.00, '2024-01-15', '2024-06-30', 'in_progress', 1),
('Sistema de Aguas Lluvias', 'Construccion de canales y sistema de drenaje', 'Sector Las Acacias, Guatire', 1800000.00, '2024-02-01', '2024-08-30', 'pending', 2),
('Recuperacion Plaza Bolivar', 'Remodelacion y recuperacion de la Plaza Bolivar', 'Centro de Guarenas', 950000.00, '2024-03-01', '2024-05-15', 'pending', 1),
('Alumbrado Publico Sector El Mamey', 'Instalacion de 150 postes de alumbrado LED', 'Sector El Mamey, Guarenas', 1200000.00, '2024-04-01', '2024-07-31', 'pending', 2);

SELECT setval('users_id_seq', (SELECT COALESCE(MAX(id), 1) FROM users), false);
SELECT setval('contractors_id_seq', (SELECT COALESCE(MAX(id), 1) FROM contractors), false);
SELECT setval('projects_id_seq', (SELECT COALESCE(MAX(id), 1) FROM projects), false);
