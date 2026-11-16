-- Учебные записи для проверки двух ролей.
INSERT INTO users (login, password_hash, role) VALUES
('DemoAdmin', '$2a$11$9yxyEGGhX2MR3eOG7wLg1O/Ohy0LXoQfO3yqu4SS14GiVnCvhxzWe', 'admin'),
('DemoUser', '$2a$11$K5Qge6oYTtJCC1MlE210jeR.G5BSbzxcktC0fEvPxCUDLlm7X0J/m', 'user')
ON DUPLICATE KEY UPDATE login = login;
