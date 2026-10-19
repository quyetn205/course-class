-- Seed default Admin account
-- Password: admin123 (BCrypt hash)
INSERT INTO users (name, email, password, role, status, created_at)
VALUES (
    'Admin',
    'admin@lms.com',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    'ADMIN',
    'ACTIVE',
    NOW()
);
