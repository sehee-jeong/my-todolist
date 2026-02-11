# 기술 아키텍처 다이어그램: my-todolist

## 문서 정보

| 항목 | 내용 |
|------|------|
| 버전 | v1.0 |
| 작성일 | 2026-02-11 |
| 근거 문서 | PRD v1.0, 프로젝트 구조 설계 원칙 v1.0 |

---

## 1. 3-Tier 아키텍처 개요

```mermaid
graph TD
    subgraph Client["Presentation Tier — 프론트엔드"]
        FE["React 19 + TypeScript<br/>(Vite)"]
    end

    subgraph Server["Application Tier — 백엔드"]
        MW["JWT 인증 미들웨어"]
        API["Express REST API"]
    end

    subgraph Data["Data Tier — 데이터베이스"]
        DB[("PostgreSQL 17")]
    end

    FE -->|"HTTP/JSON (HTTPS)"| MW
    MW -->|"인증 통과"| API
    API -->|"pg 쿼리"| DB
    DB -->|"결과 반환"| API
    API -->|"JSON 응답"| FE
```

---

## 2. 주요 요청 흐름

```mermaid
sequenceDiagram
    participant FE as 브라우저<br/>(React)
    participant MW as JWT 미들웨어
    participant API as Express API
    participant DB as PostgreSQL

    %% 로그인
    FE->>API: POST /api/auth/login
    API->>DB: SELECT member WHERE email=?
    DB-->>API: member 레코드
    API-->>FE: 200 OK + JWT

    %% 할 일 조회
    FE->>MW: GET /api/todos (Authorization: Bearer JWT)
    MW-->>MW: JWT 서명 검증
    MW->>API: req.memberId 주입
    API->>DB: SELECT todos WHERE member_id=?
    DB-->>API: todo 목록
    API-->>FE: 200 OK + todos (overdue 파생 포함)
```

---

## 3. 컴포넌트 구성

```mermaid
graph LR
    subgraph FE["프론트엔드 (Vite + React 19)"]
        Page["Pages<br/>Login · Signup<br/>TodoList · TodoEdit"]
        Comp["Components<br/>TodoItem · TodoForm"]
        Hook["Hooks<br/>useAuth · useTodos"]
        Svc["Services<br/>authService · todoService"]
    end

    subgraph BE["백엔드 (Node.js + Express)"]
        Route["Routes"]
        Ctrl["Controllers"]
        BESvc["Services<br/>(비즈니스 규칙)"]
        Repo["Repositories<br/>(pg 쿼리)"]
    end

    DB[("PostgreSQL 17<br/>member · todo")]

    Page --> Comp
    Page --> Hook
    Hook --> Svc
    Svc -->|"REST API (JSON)"| Route
    Route --> Ctrl
    Ctrl --> BESvc
    BESvc --> Repo
    Repo --> DB
```

---

## 4. 인증 흐름

```mermaid
graph LR
    FE["React 앱"] -->|"이메일 + 비밀번호"| Login["POST /api/auth/login"]
    Login -->|"bcrypt 검증"| Issue["JWT 발급<br/>(만료 24시간)"]
    Issue -->|"토큰 저장"| FE
    FE -->|"Bearer JWT"| Auth["JWT 미들웨어"]
    Auth -->|"유효"| Protected["보호 API<br/>/api/todos/*"]
    Auth -->|"무효·만료"| Err["401 Unauthorized"]
```

---

## 스택 요약

| 계층 | 기술 |
|------|------|
| 프론트엔드 | React 19, TypeScript, Vite |
| 백엔드 | Node.js, Express |
| 인증 | JWT (jsonwebtoken), bcrypt |
| 데이터베이스 | PostgreSQL 17 (pg 드라이버) |
| 배포 | Vercel |
