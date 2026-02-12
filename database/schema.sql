-- =============================================================
-- my-todolist DDL
-- PostgreSQL 17
-- 근거 문서: ERD v1.0, 도메인 정의서 v1.2
-- =============================================================

-- -------------------------------------------------------------
-- MEMBER
-- -------------------------------------------------------------
CREATE TABLE member (
    id         UUID         NOT NULL DEFAULT gen_random_uuid(),
    email      VARCHAR(255) NOT NULL,
    password   VARCHAR(255) NOT NULL,
    nickname   VARCHAR(50)  NOT NULL,
    created_at TIMESTAMPTZ  NOT NULL DEFAULT now(),

    CONSTRAINT member_pkey   PRIMARY KEY (id),
    CONSTRAINT member_email_uk UNIQUE (email)
);

-- -------------------------------------------------------------
-- TODO
-- -------------------------------------------------------------
CREATE TABLE todo (
    id          UUID         NOT NULL DEFAULT gen_random_uuid(),
    member_id   UUID         NOT NULL,
    title       VARCHAR(255) NOT NULL,
    description TEXT,
    due_date    DATE,
    status      VARCHAR(10)  NOT NULL DEFAULT 'PENDING',
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),

    CONSTRAINT todo_pkey      PRIMARY KEY (id),
    CONSTRAINT todo_status_ck CHECK (status IN ('PENDING', 'DONE')),
    CONSTRAINT todo_member_fk FOREIGN KEY (member_id)
        REFERENCES member (id)
        ON DELETE CASCADE
);

CREATE INDEX todo_member_id_idx ON todo (member_id);

-- -------------------------------------------------------------
-- REFRESH_TOKEN
-- -------------------------------------------------------------
CREATE TABLE refresh_token (
    id         UUID         NOT NULL DEFAULT gen_random_uuid(),
    member_id  UUID         NOT NULL,
    token      VARCHAR(36)  NOT NULL,
    expires_at TIMESTAMPTZ  NOT NULL,
    created_at TIMESTAMPTZ  NOT NULL DEFAULT now(),

    CONSTRAINT refresh_token_pkey      PRIMARY KEY (id),
    CONSTRAINT refresh_token_token_uk  UNIQUE (token),
    CONSTRAINT refresh_token_member_fk FOREIGN KEY (member_id)
        REFERENCES member (id) ON DELETE CASCADE
);

CREATE INDEX refresh_token_token_idx     ON refresh_token (token);
CREATE INDEX refresh_token_member_id_idx ON refresh_token (member_id);
