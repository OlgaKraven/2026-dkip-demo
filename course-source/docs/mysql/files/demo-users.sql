CREATE TABLE IF NOT EXISTS users (
    id              BIGINT NOT NULL AUTO_INCREMENT,
    login           VARCHAR(64) NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,
    role            ENUM('admin','user') NOT NULL DEFAULT 'user',
    failed_attempts INT NOT NULL DEFAULT 0,
    is_locked       TINYINT(1) NOT NULL DEFAULT 0,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_users_login (login),
    CHECK (failed_attempts >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO users (login, password_hash, role) VALUES
('DemoAdmin', '$2a$11$9yxyEGGhX2MR3eOG7wLg1O/Ohy0LXoQfO3yqu4SS14GiVnCvhxzWe', 'admin'),
('DemoUser', '$2a$11$K5Qge6oYTtJCC1MlE210jeR.G5BSbzxcktC0fEvPxCUDLlm7X0J/m', 'user')
ON DUPLICATE KEY UPDATE login = login;
