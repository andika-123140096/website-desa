-- Seed superadmin account
INSERT INTO pengguna (id, nama_lengkap, username, password, roles) 
VALUES ('admin-001', 'Administrator', 'admin', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'superadmin');
-- Password: password123 (hashed dengan SHA-256)

INSERT INTO perangkat_desa (id, jabatan, id_dusun)
VALUES ('admin-001', 'superadmin', NULL);
