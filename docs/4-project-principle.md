# 프로젝트 구조 설계 원칙: my-todolist

## 문서 정보

| 항목 | 내용 |
|------|------|
| 버전 | v1.0 |
| 작성일 | 2026-02-11 |
| 근거 문서 | 도메인 정의서 v1.2, PRD v1.0 |

---

## 1. 최상위 원칙 (공통)

### 1.1 단순함 우선

- 현재 요구사항만 충족하는 코드를 작성한다. 미래 확장을 위한 추상화는 실제 필요 시점에 도입한다.
- MVP 범위(F-01 ~ F-08) 외의 기능(Post-MVP)을 위한 구조를 선제적으로 만들지 않는다.
- 하나의 파일/함수/컴포넌트는 하나의 책임만 진다.

### 1.2 도메인 언어 일치

- 코드 전반에서 유비쿼터스 언어를 그대로 사용한다.

| 도메인 용어 | 코드 식별자 |
|------------|------------|
| Member | member, Member |
| Todo | todo, Todo |
| PENDING | `'PENDING'` |
| DONE | `'DONE'` |
| Overdue | `overdue` |
| dueDate | `dueDate` |

### 1.3 경계 검증 원칙

- 유효성 검사는 시스템 경계(사용자 입력, 외부 API 응답)에서만 수행한다.
- 내부 레이어 간 호출에서는 중복 검증을 추가하지 않는다.

### 1.4 오류 응답 일관성

- HTTP 상태 코드는 PRD 및 도메인 정의서에 명시된 값을 준수한다.

| 상황 | 코드 |
|------|------|
| 미인증 요청 | 401 |
| 타인 리소스 접근 | 403 |
| 리소스 미존재 | 404 |
| 이메일 중복 | 409 |
| 잘못된 상태 전이 | 400 |

---

## 2. 의존성 / 레이어 원칙

### 2.1 백엔드 레이어 구조

```
Route → Controller → Service → Repository → DB(PostgreSQL)
```

- **Route**: URL 매핑과 미들웨어 체인만 선언한다.
- **Controller**: HTTP 요청 파싱과 응답 직렬화만 담당한다. 비즈니스 로직을 포함하지 않는다.
- **Service**: 비즈니스 규칙(BR-M-*, BR-T-*)을 구현한다. HTTP 컨텍스트(req, res)에 의존하지 않는다.
- **Repository**: SQL 쿼리만 담당한다. `pg` 클라이언트를 직접 사용하며 Prisma는 사용하지 않는다.

의존 방향은 단방향이다. 하위 레이어는 상위 레이어를 참조하지 않는다.

```
Controller  →  Service  →  Repository
(HTTP 계층)   (도메인 계층)  (데이터 계층)
```

### 2.2 프론트엔드 레이어 구조

```
Page → Component → Hook → Service(API 클라이언트)
```

- **Page**: 라우트 단위 컴포넌트. 레이아웃 조합과 데이터 페칭 진입점 역할만 한다.
- **Component**: 표시 로직만 포함한다. 비즈니스 판단(overdue 여부 등)은 hook 또는 service에서 수행한다.
- **Hook**: 서버 상태 관리, 폼 상태, 부수효과를 캡슐화한다.
- **Service**: API 호출만 담당한다. `fetch` 또는 `axios`를 직접 래핑하며, UI 상태를 알지 못한다.

### 2.3 순환 의존 금지

- 동일 레이어 내 파일 간 순환 참조를 허용하지 않는다.
- 공통 타입은 `types/` 디렉토리에 분리하여 단방향으로 참조한다.

---

## 3. 코드 / 네이밍 원칙

### 3.1 파일 네이밍

| 구분 | 규칙 | 예시 |
|------|------|------|
| 프론트엔드 컴포넌트 | PascalCase | `TodoList.tsx`, `TodoItem.tsx` |
| 프론트엔드 훅 | camelCase, `use` 접두사 | `useTodos.ts`, `useAuth.ts` |
| 프론트엔드 서비스/유틸 | camelCase | `todoService.ts`, `authService.ts` |
| 백엔드 파일 전체 | camelCase | `todoController.ts`, `todoService.ts` |
| 타입 정의 파일 | camelCase | `todo.types.ts`, `member.types.ts` |
| 테스트 파일 | 대상 파일명 + `.test` | `todoService.test.ts` |

### 3.2 변수 / 함수 네이밍

- 변수·함수: camelCase
- 클래스·인터페이스·타입: PascalCase
- 상수: UPPER_SNAKE_CASE
- 불리언 변수: `is`, `has`, `can` 접두사 사용 (`isOverdue`, `isDone`)

### 3.3 API 경로 네이밍

- REST 리소스는 복수 명사를 사용한다.
- 동사 표현이 필요한 상태 전이는 하위 경로로 표현한다.

```
POST   /api/auth/signup
POST   /api/auth/login
GET    /api/todos
POST   /api/todos
PATCH  /api/todos/:id
DELETE /api/todos/:id
PATCH  /api/todos/:id/complete
PATCH  /api/todos/:id/revert
```

### 3.4 TypeScript 원칙

- `any` 타입 사용을 금지한다.
- API 요청/응답 타입은 프론트엔드와 백엔드 각각 `types/` 디렉토리에 명시적으로 선언한다.
- 도메인 상태 열거형은 리터럴 유니온 타입으로 정의한다.

```typescript
type TodoStatus = 'PENDING' | 'DONE';
```

---

## 4. 테스트 / 품질 원칙

### 4.1 테스트 범위

- 백엔드 Service 레이어는 단위 테스트를 필수로 작성한다. 비즈니스 규칙(BR-T-*, BR-M-*) 검증에 집중한다.
- 인수 기준(F-01 ~ F-08)은 통합 테스트 또는 E2E 시나리오(SC-H-*, SC-E-*, SC-E2E-*)로 커버한다.
- UI 컴포넌트 단위 테스트는 MVP 범위에서 선택 사항이다.

### 4.2 테스트 명명

테스트 설명은 `given / when / then` 또는 `~이면 ~한다` 형식으로 작성한다.

```typescript
it('PENDING 상태 할 일에 완료 요청 시 DONE으로 변경된다')
it('이미 DONE 상태에서 완료 요청 시 400을 반환한다')
```

### 4.3 품질 기준

- 빌드 오류, TypeScript 타입 오류가 없는 상태로 커밋한다.
- 린트 규칙(ESLint)을 통과한 코드만 커밋한다.
- API 응답 시간 500ms 이하(NFR-P-01), 목록 조회 1초 이하(NFR-P-02)를 목표로 한다.

---

## 5. 설정 / 보안 / 운영 원칙

### 5.1 환경 변수 관리

- 모든 시크릿(JWT_SECRET, DATABASE_URL 등)은 `.env` 파일로 관리하고 Git에 커밋하지 않는다.
- `.env.example`을 저장소에 포함하여 필요한 변수 목록을 문서화한다.

```
# .env.example
DATABASE_URL=postgresql://user:password@localhost:5432/todolist
JWT_SECRET=your-secret-key
PORT=3000
```

### 5.2 보안 원칙

| 항목 | 구현 방법 |
|------|----------|
| 비밀번호 저장 (NFR-S-01) | bcrypt, cost factor 10 이상 |
| 인증 토큰 (NFR-S-02) | JWT, 서버 서명 검증 |
| 토큰 만료 (NFR-S-03) | 발급 후 24시간 |
| 전송 보안 (NFR-S-04) | HTTPS 필수 (배포 환경) |
| 소유권 검증 | 모든 할 일 CUD 요청에서 `memberId` 일치 여부 확인 |

- 응답 바디에 비밀번호 해시 값을 절대 포함하지 않는다.
- JWT 검증 미들웨어는 인증이 필요한 모든 라우트에 적용한다.

### 5.3 데이터베이스 원칙

- `pg` 클라이언트를 직접 사용한다 (Prisma 사용 금지).
- SQL 쿼리는 파라미터 바인딩(`$1`, `$2`)을 사용하여 SQL 인젝션을 방지한다.
- 마이그레이션 스크립트는 `db/migrations/` 디렉토리에서 버전 관리한다.

### 5.4 운영 원칙

- 프로세스 크래시를 유발할 수 있는 에러는 Express 전역 에러 핸들러에서 포착하여 500 응답으로 처리한다.
- 에러 응답 바디에 스택 트레이스를 포함하지 않는다 (프로덕션 환경).

---

## 6. 디렉토리 구조

### 6.1 루트 구조

```
my-todolist/
├── frontend/          # React 19 + TypeScript (Vite)
├── backend/           # Node.js / Express
├── docs/              # 프로젝트 문서
└── README.md
```

### 6.2 프론트엔드 디렉토리 구조

```
frontend/
├── public/
├── src/
│   ├── assets/            # 정적 파일 (이미지, 폰트)
│   ├── components/
│   │   ├── common/        # Button, Input 등 범용 UI 컴포넌트
│   │   └── todo/          # TodoList, TodoItem, TodoForm 등 할 일 도메인 컴포넌트
│   ├── hooks/             # useTodos, useAuth 등 커스텀 훅
│   ├── pages/             # LoginPage, SignupPage, TodoListPage 등 라우트 단위 페이지
│   ├── services/          # authService.ts, todoService.ts (API 호출)
│   ├── types/             # todo.types.ts, member.types.ts
│   └── utils/             # 날짜 계산, overdue 판정 등 순수 함수
├── index.html
├── vite.config.ts
└── tsconfig.json
```

- 라우트는 PRD 6.1 핵심 화면 목록을 기준으로 구성한다.

| 경로 | 페이지 컴포넌트 |
|------|--------------|
| `/signup` | `SignupPage` |
| `/login` | `LoginPage` |
| `/` | `TodoListPage` (인증 필요) |
| `/todos/new` | `TodoNewPage` |
| `/todos/:id/edit` | `TodoEditPage` |

### 6.3 백엔드 디렉토리 구조

```
backend/
├── src/
│   ├── config/            # db.ts (pg 풀 설정), env.ts
│   ├── middlewares/
│   │   ├── auth.ts        # JWT 검증 미들웨어
│   │   └── errorHandler.ts
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   └── todo.routes.ts
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   └── todo.controller.ts
│   ├── services/
│   │   ├── auth.service.ts
│   │   └── todo.service.ts
│   ├── repositories/
│   │   ├── member.repository.ts
│   │   └── todo.repository.ts
│   ├── types/
│   │   ├── member.types.ts
│   │   └── todo.types.ts
│   └── app.ts             # Express 앱 초기화
├── db/
│   └── migrations/        # SQL 마이그레이션 파일
├── tests/
│   ├── unit/              # 서비스 레이어 단위 테스트
│   └── integration/       # API 엔드포인트 통합 테스트
├── .env.example
├── package.json
└── tsconfig.json
```

#### 책임 요약

| 파일 유형 | 담당 |
|----------|------|
| `*.routes.ts` | 경로 매핑, 미들웨어 적용 |
| `*.controller.ts` | req 파싱, res 직렬화 |
| `*.service.ts` | 비즈니스 규칙(BR-*) 구현 |
| `*.repository.ts` | SQL 쿼리 실행 |
| `middlewares/auth.ts` | JWT 검증 및 `req.memberId` 주입 |
