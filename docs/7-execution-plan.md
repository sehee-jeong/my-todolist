# 실행계획: my-todolist

## 문서 정보

| 항목 | 내용 |
|------|------|
| 버전 | v1.0 |
| 작성일 | 2026-02-11 |
| 근거 문서 | PRD v1.0, 설계 원칙 v1.0, ERD v1.0 |
| 개발 기간 | 2026-02-10 ~ 2026-02-13 (3일) |

---

## 마일스톤 개요

| 마일스톤 | 일정 | 포함 Task |
|----------|------|-----------|
| M1: DB + 백엔드 API | 2026-02-10 | DB-01, DB-02, BE-01 ~ BE-07 |
| M2: 프론트엔드 구현 | 2026-02-11 ~ 12 | FE-01 ~ FE-07 |
| M3: 통합 테스트 + 배포 | 2026-02-13 오후 | QA-01, QA-02 |

---

## 의존성 맵

```
DB-01 → DB-02 → BE-02
BE-01 → BE-02 → BE-03 → BE-04
                BE-04 → BE-05 → BE-06 → BE-07
BE-07 → FE-01 → FE-02 → FE-03 → FE-04 → FE-05 → FE-06 → FE-07
FE-07 → QA-01 → QA-02
```

---

## 데이터베이스

### DB-01: 개발 환경 PostgreSQL 초기화

**의존성:** 없음

**작업 내용:**
- [x] PostgreSQL 17 로컬 설치 또는 Docker 컨테이너 실행 확인
- [x] `todolist_dev` 데이터베이스 생성
- [x] `.env` 파일에 `DATABASE_URL` 작성
- [x] `.env.example` 파일 생성 (시크릿 값 제외)

**완료 조건:**
- [x] `psql -d todolist_dev` 접속 성공
- [x] `.env.example`에 `DATABASE_URL` 키 존재

---

### DB-02: DDL 적용 및 스키마 검증

**의존성:** DB-01

**작업 내용:**
- [x] `database/schema.sql` 을 대상 DB에 실행
- [x] `member`, `todo` 테이블 생성 확인
- [x] `todo_member_id_idx` 인덱스 생성 확인
- [x] `todo_status_ck` CHECK 제약 동작 확인

**완료 조건:**
- [x] `\dt` 명령으로 `member`, `todo` 테이블 확인
- [x] `INSERT INTO todo (status) VALUES ('INVALID')` 실행 시 오류 발생
- [x] `EXPLAIN SELECT * FROM todo WHERE member_id = '...'` 결과에 Index Scan 포함

---

## 백엔드

### BE-01: 백엔드 프로젝트 초기 세팅

**의존성:** 없음

**작업 내용:**
- [x] `backend/` 디렉토리에 Node.js + TypeScript 프로젝트 초기화
- [x] 의존성 설치: `express`, `pg`, `jsonwebtoken`, `bcrypt`
- [x] 개발 의존성 설치: `typescript`, `ts-node-dev`, `@types/*`, `eslint`
- [x] `tsconfig.json` 설정 (`strict: true`, `any` 금지)
- [x] `src/app.ts` Express 앱 기본 구조 작성 (JSON 파서, 전역 에러 핸들러)
- [x] `npm run dev` 스크립트 설정

**완료 조건:**
- [x] `npm run dev` 실행 후 서버 기동 로그 출력
- [x] `GET /health` → `200 OK` 응답
- [x] TypeScript 컴파일 오류 없음

---

### BE-02: DB 연결 설정

**의존성:** DB-01, BE-01

**작업 내용:**
- [x] `src/config/db.ts` 에 `pg.Pool` 설정 (환경 변수에서 `DATABASE_URL` 로드)
- [x] 연결 실패 시 프로세스 종료 처리

**완료 조건:**
- [x] 서버 기동 시 DB 연결 성공 로그 출력
- [x] 잘못된 `DATABASE_URL` 설정 시 명확한 에러 메시지 출력 후 종료

---

### BE-03: Member Repository 구현

**의존성:** DB-02, BE-02

**작업 내용:**
- [x] `src/repositories/member.repository.ts` 작성
- [x] `findByEmail(email)` — 이메일로 회원 조회
- [x] `create({ email, password, nickname })` — 회원 생성, 생성된 레코드 반환

**완료 조건:**
- [x] `findByEmail` 이 존재하지 않는 이메일에 대해 `null` 반환
- [x] `create` 호출 후 DB에서 해당 레코드 조회 성공
- [x] 모든 쿼리에 파라미터 바인딩 사용 (SQL 인젝션 방지)

---

### BE-04: 인증 API 구현 (회원가입 · 로그인)

**의존성:** BE-03

**작업 내용:**
- [x] `src/services/auth.service.ts` 작성
  - [x] `signup`: 이메일 중복 검사(409), 비밀번호 정책 검증(400), bcrypt 해싱(cost 10), 회원 저장
  - [x] `login`: 이메일 조회, bcrypt 비교, JWT 발급(만료 24시간)
- [x] `src/controllers/auth.controller.ts` 작성
- [x] `src/routes/auth.routes.ts` 작성
  - [x] `POST /api/auth/signup`
  - [x] `POST /api/auth/login`
- [x] 응답 바디에 `password` 필드 미포함 확인

**완료 조건:**
- [x] 유효한 이메일·비밀번호·닉네임 → `POST /api/auth/signup` → `201 Created`
- [x] 중복 이메일 → `409 Conflict`
- [x] 비밀번호 8자 미만 또는 영문·숫자 미포함 → `400 Bad Request`
- [x] 유효한 자격증명 → `POST /api/auth/login` → `200 OK` + JWT 포함
- [x] 잘못된 비밀번호 → `401 Unauthorized`
- [x] 미등록 이메일 → `401 Unauthorized`
- [x] 응답에 비밀번호 해시 미포함

---

### BE-05: JWT 인증 미들웨어 구현

**의존성:** BE-04

**작업 내용:**
- [x] `src/middlewares/auth.ts` 작성
  - [x] `Authorization: Bearer <token>` 헤더 파싱
  - [x] JWT 서명 검증, 만료 검증
  - [x] 검증 성공 시 `req.memberId` 주입
  - [x] 검증 실패 시 `401 Unauthorized` 반환

**완료 조건:**
- [x] 유효한 JWT → `req.memberId` 에 회원 UUID 주입
- [x] 헤더 없음 → `401`
- [x] 만료된 토큰 → `401`
- [x] 서명 위조 토큰 → `401`

---

### BE-06: Todo Repository 구현

**의존성:** DB-02, BE-02

**작업 내용:**
- [x] `src/repositories/todo.repository.ts` 작성
  - [x] `findAllByMemberId(memberId)` — 목록 조회 (생성일 내림차순)
  - [x] `findById(id)` — 단건 조회
  - [x] `create({ memberId, title, description, dueDate })` — 생성
  - [x] `update(id, { title, description, dueDate })` — 수정, `updated_at` 갱신
  - [x] `updateStatus(id, status)` — 상태 변경, `updated_at` 갱신
  - [x] `deleteById(id)` — 물리 삭제

**완료 조건:**
- [x] `findAllByMemberId` 가 해당 회원 소유 레코드만 반환
- [x] `create` 후 `status = 'PENDING'` 확인
- [x] `deleteById` 후 `findById` 에서 `null` 반환
- [x] 모든 쿼리에 파라미터 바인딩 사용

---

### BE-07: Todo API 구현 (CRUD + 상태 전이)

**의존성:** BE-05, BE-06

**작업 내용:**
- [x] `src/services/todo.service.ts` 작성
  - [x] `getAll(memberId)`: 목록 조회, `overdue` 파생 필드 계산 (`dueDate < TODAY AND status = PENDING`)
  - [x] `create(memberId, dto)`: 할 일 생성
  - [x] `update(memberId, id, dto)`: 소유권 확인(403) 후 수정
  - [x] `remove(memberId, id)`: 소유권 확인(403) 후 물리 삭제
  - [x] `complete(memberId, id)`: 소유권 확인(403), DONE 상태이면 400, PENDING → DONE
  - [x] `revert(memberId, id)`: 소유권 확인(403), PENDING 상태이면 400, DONE → PENDING
- [x] `src/controllers/todo.controller.ts` 작성
- [x] `src/routes/todo.routes.ts` 작성 (모든 라우트에 JWT 미들웨어 적용)
  - [x] `GET    /api/todos`
  - [x] `POST   /api/todos`
  - [x] `PATCH  /api/todos/:id`
  - [x] `DELETE /api/todos/:id`
  - [x] `PATCH  /api/todos/:id/complete`
  - [x] `PATCH  /api/todos/:id/revert`

**완료 조건:**
- [x] 미인증 요청 모두 → `401`
- [x] 타인 소유 수정·삭제·상태변경 → `403`
- [x] `GET /api/todos` → 본인 소유 목록 + `overdue` 필드 포함
- [x] `dueDate < 오늘 AND status = PENDING` → `overdue: true`
- [x] `DONE` 항목의 `dueDate` 가 과거여도 → `overdue: false`
- [x] 제목 없이 생성 → `400`
- [x] `DONE` 상태에서 complete 요청 → `400`
- [x] `PENDING` 상태에서 revert 요청 → `400`
- [x] 삭제 후 동일 ID 조회 → `404`

---

## 프론트엔드

### FE-01: 프론트엔드 프로젝트 초기 세팅

**의존성:** BE-01 (API 경로 확정 후)

**작업 내용:**
- [x] `frontend/` 디렉토리에 Vite + React 19 + TypeScript 프로젝트 초기화
- [x] 의존성 설치: `react-router-dom`
- [x] `tsconfig.json` 설정 (`strict: true`)
- [x] ESLint 설정
- [x] `src/types/` 디렉토리에 공통 타입 정의 (`todo.types.ts`, `member.types.ts`)
- [x] `vite.config.ts` 에 API 프록시 설정 (개발 환경)

**완료 조건:**
- [x] `npm run dev` 실행 후 브라우저에서 기본 화면 확인
- [x] TypeScript 컴파일 오류 없음
- [x] `TodoStatus = 'PENDING' | 'DONE'` 타입 정의 존재

---

### FE-02: API Service 레이어 구현

**의존성:** FE-01

**작업 내용:**
- [x] `src/services/authService.ts` 작성
  - [x] `signup(email, password, nickname)` — `POST /api/auth/signup`
  - [x] `login(email, password)` — `POST /api/auth/login`, JWT 로컬 스토리지 저장
  - [x] `logout()` — 로컬 스토리지에서 JWT 제거
- [x] `src/services/todoService.ts` 작성
  - [x] `getAll()` — `GET /api/todos`
  - [x] `create(dto)` — `POST /api/todos`
  - [x] `update(id, dto)` — `PATCH /api/todos/:id`
  - [x] `remove(id)` — `DELETE /api/todos/:id`
  - [x] `complete(id)` — `PATCH /api/todos/:id/complete`
  - [x] `revert(id)` — `PATCH /api/todos/:id/revert`
- [x] 모든 요청에 `Authorization: Bearer <token>` 헤더 자동 삽입
- [x] `401` 응답 수신 시 로그인 페이지로 리다이렉트

**완료 조건:**
- [x] `login()` 호출 후 로컬 스토리지에 JWT 저장 확인
- [x] `getAll()` 호출 시 Authorization 헤더 포함 확인 (Network 탭)
- [x] `any` 타입 미사용

---

### FE-03: 인증 페이지 구현 (회원가입 · 로그인)

**의존성:** FE-02

**작업 내용:**
- [x] `src/pages/SignupPage.tsx` 작성
  - [x] 이메일·비밀번호·닉네임 입력 폼
  - [x] 클라이언트 측 입력 검증 (이메일 형식, 비밀번호 8자+영문+숫자)
  - [x] 409 응답 → 인라인 오류 메시지 표시
  - [x] 가입 성공 → 로그인 페이지 이동
- [x] `src/pages/LoginPage.tsx` 작성
  - [x] 이메일·비밀번호 입력 폼
  - [x] 401 응답 → 인라인 오류 메시지 표시
  - [x] 로그인 성공 → 할 일 목록 페이지 이동
  - [x] 회원가입 링크 제공
- [x] `src/router.tsx` 에 `/signup`, `/login` 라우트 등록
- [x] 인증된 사용자가 `/login`, `/signup` 접근 시 `/` 로 리다이렉트

**완료 조건:**
- [x] 유효한 입력으로 회원가입 후 로그인 페이지로 이동
- [x] 중복 이메일 → 폼 하단 오류 메시지 표시
- [x] 로그인 성공 후 JWT 저장 및 목록 페이지 이동
- [x] 잘못된 자격증명 → 오류 메시지 표시

---

### FE-04: 할 일 목록 페이지 구현

**의존성:** FE-03

**작업 내용:**
- [x] `src/pages/TodoListPage.tsx` 작성
  - [x] 마운트 시 `todoService.getAll()` 호출
  - [x] 로그아웃 버튼
  - [x] 할 일 추가 버튼 → `/todos/new` 이동
- [x] `src/components/todo/TodoItem.tsx` 작성
  - [x] 제목, 마감일, 상태 표시
  - [x] DONE 상태 → 제목 취소선 + 흐린 색상
  - [x] 완료·취소 토글 버튼
  - [x] 수정 버튼 → `/todos/:id/edit` 이동
  - [x] 삭제 버튼 → 확인 후 삭제 요청
- [x] `src/hooks/useTodos.ts` 작성 (목록 조회, 완료/취소, 삭제 상태 관리)
- [x] 미인증 접근 시 `/login` 리다이렉트 처리 (Protected Route)
- [x] 목록 기본 정렬: 생성일 내림차순

**완료 조건:**
- [x] 본인 소유 할 일만 목록에 표시
- [x] DONE 항목 제목에 취소선 적용 확인
- [x] 완료 버튼 클릭 → 상태 DONE 변경 후 UI 즉시 반영
- [x] 삭제 후 목록에서 제거 확인
- [x] 미인증 상태로 `/` 접근 시 `/login` 리다이렉트

---

### FE-05: 할 일 생성 · 수정 페이지 구현

**의존성:** FE-04

**작업 내용:**
- [x] `src/pages/TodoNewPage.tsx` 작성
  - [x] 제목(필수)·설명(선택)·마감일(선택) 입력 폼
  - [x] 제목 미입력 시 제출 차단 및 오류 메시지
  - [x] 생성 성공 → 목록 페이지 이동
- [x] `src/pages/TodoEditPage.tsx` 작성
  - [x] 기존 값 불러오기 (`/api/todos/:id` 또는 목록 캐시 활용)
  - [x] 제목·설명·마감일 수정 후 저장
  - [x] 저장 성공 → 목록 페이지 이동
- [x] `src/router.tsx` 에 `/todos/new`, `/todos/:id/edit` 라우트 등록

**완료 조건:**
- [x] 제목만 입력해도 생성 가능
- [x] 제목 없이 제출 시 폼 오류 표시 및 API 호출 차단
- [x] 수정 폼에 기존 값 초기 표시
- [x] 수정 저장 성공 → 목록에 변경 내용 반영

---

### FE-06: Overdue 시각화 구현

**의존성:** FE-04

**작업 내용:**
- [x] `TodoItem.tsx` 에 `overdue` 필드 기반 배지 조건부 렌더링
  - [x] `overdue: true` → 붉은 배지 (`#D32F2F` 계열) + "마감 초과" 레이블
  - [x] `overdue: true` → 강조 테두리 적용
  - [x] DONE 상태 항목 → Overdue 배지 미표시

**완료 조건:**
- [x] `status = PENDING` AND `dueDate < 오늘` → 붉은 배지 + "마감 초과" 표시
- [x] `status = DONE` → dueDate 과거여도 배지 미표시
- [x] `dueDate = null` → 배지 미표시
- [x] 완료 처리 직후 배지 즉시 사라짐 (UI 반영)

---

### FE-07: 반응형 UI 적용

**의존성:** FE-05, FE-06

**작업 내용:**
- [x] 모든 페이지에 반응형 레이아웃 적용 (최소 뷰포트 360px)
- [x] 모바일(360px) · 데스크탑(1280px) 기준 레이아웃 확인
- [x] 터치 타겟 크기 적정 여부 확인 (최소 44px)
- [x] 오류 UX 처리 확인
  - [x] 미인증 접근 → 로그인 리다이렉트
  - [x] 403 → "접근 권한이 없습니다" 메시지
  - [x] 400 (잘못된 상태 전이) → 토스트 알림

**완료 조건:**
- [x] Chrome DevTools 모바일 에뮬레이터(360px)에서 레이아웃 깨짐 없음
- [x] 주요 4개 브라우저(Chrome·Firefox·Safari·Edge 최신)에서 기본 동작 확인
- [x] 모든 오류 UX 항목 화면에서 확인

---

## 품질 검증

### QA-01: 시나리오 기반 통합 테스트

**의존성:** FE-07

**작업 내용:**
- [ ] SC-H-01 ~ SC-H-11 (정상 흐름 11건) 수동 확인
- [ ] SC-E-01 ~ SC-E-12 (예외 흐름 12건) 수동 확인
- [ ] SC-E2E-01: 직장인 김민준 시나리오 전체 흐름 확인
- [ ] SC-E2E-02: 대학생 이수아 시나리오 전체 흐름 확인

**완료 조건:**
- [ ] 25개 시나리오 전체 기대 결과 일치
- [ ] NFR-S-01 ~ NFR-S-04 보안 항목 확인
  - [ ] DB에 저장된 비밀번호가 bcrypt 해시값인지 확인
  - [ ] JWT 만료 24시간 확인
  - [ ] 타인 토큰으로 접근 시 403 반환 확인

---

### QA-02: 성능·배포 최종 확인

**의존성:** QA-01

**작업 내용:**
- [ ] API 평균 응답 시간 500ms 이하 확인 (NFR-P-01)
- [ ] 할 일 목록 조회 1초 이하 확인 (NFR-P-02)
- [ ] `.env` 파일 Git 미포함 확인 (`.gitignore` 검토)
- [ ] 에러 응답에 스택 트레이스 미포함 확인
- [ ] Vercel 배포 설정 확인

**완료 조건:**
- [ ] Network 탭 기준 주요 API 응답 500ms 이하
- [ ] `.env` 가 `.gitignore` 에 포함
- [ ] 프로덕션 에러 응답에 스택 트레이스 미노출
- [ ] MVP 배포 완료 URL 접속 확인
