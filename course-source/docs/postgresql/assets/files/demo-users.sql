-- schema: app (как у вас)
create table if not exists app.users (
    id              bigserial primary key,
    login           text not null unique,
    password_hash   text not null,
    role            text not null check (role in ('admin', 'user')),
    failed_attempts int not null default 0 check (failed_attempts >= 0),
    is_locked       boolean not null default false,
    created_at      timestamptz not null default now(),
    updated_at      timestamptz not null default now()
);

create index if not exists ix_users_login on app.users (login);

INSERT INTO app.users (login, password_hash, role) VALUES
('DemoAdmin', '$2a$11$9yxyEGGhX2MR3eOG7wLg1O/Ohy0LXoQfO3yqu4SS14GiVnCvhxzWe', 'admin'),
('DemoUser', '$2a$11$K5Qge6oYTtJCC1MlE210jeR.G5BSbzxcktC0fEvPxCUDLlm7X0J/m', 'user')
ON CONFLICT (login) DO NOTHING;
