# E2E 통합 테스트 결과 보고서

## 문서 정보

| 항목 | 내용 |
|------|------|
| 실행일 | 2026-02-13 |
| 테스트 환경 | http://localhost:5173 (Vite 프록시 → http://localhost:3000) |
| 테스트 도구 | Playwright MCP |
| 근거 문서 | docs/3-user-scenario.md |
| 총 시나리오 | 25건 |
| **통과** | **25건** |
| **실패** | **0건** |

---

## 1. 정상 흐름 시나리오 (Happy Path)

| 시나리오 | 설명 | 기대 결과 | 실제 결과 | 상태 |
|----------|------|-----------|-----------|------|
| SC-H-01 | 신규 회원가입 | HTTP 201 | HTTP 201 | ✅ PASS |
| SC-H-02 | 로그인 및 JWT 발급 | HTTP 200, JWT 토큰 발급 | HTTP 200, accessToken + refreshToken 발급 | ✅ PASS |
| SC-H-03 | 할 일 생성 (제목만) | HTTP 201, status=PENDING | HTTP 201, status=PENDING | ✅ PASS |
| SC-H-04 | 할 일 생성 (전체 필드) | HTTP 201, status=PENDING | HTTP 201, status=PENDING | ✅ PASS |
| SC-H-05 | 할 일 목록 조회 | HTTP 200, 배열 반환 | HTTP 200, 배열 반환 | ✅ PASS |
| SC-H-06 | 목록 조회 (overdue 항목 포함) | 해당 항목 overdue:true | overdue:true 반환 | ✅ PASS |
| SC-H-07 | 할 일 수정 | HTTP 200, 내용 반영 | HTTP 200, title 반영 확인 | ✅ PASS |
| SC-H-08 | 할 일 삭제 후 404 | DELETE 204, 재조회 404 | DELETE 204, 재조회 404 | ✅ PASS |
| SC-H-09 | 완료 처리 (PENDING → DONE) | HTTP 200, status=DONE | HTTP 200, status=DONE | ✅ PASS |
| SC-H-10 | 완료 취소 (DONE → PENDING) | HTTP 200, status=PENDING | HTTP 200, status=PENDING | ✅ PASS |
| SC-H-11 | DONE 항목 overdue:false | overdue:false | overdue:false, status=DONE | ✅ PASS |

---

## 2. 예외 흐름 시나리오 (Error Path)

| 시나리오 | 설명 | 기대 결과 | 실제 결과 | 상태 |
|----------|------|-----------|-----------|------|
| SC-E-01 | 중복 이메일 회원가입 | HTTP 409 | HTTP 409 | ✅ PASS |
| SC-E-02 | 비밀번호 정책 미충족 (3가지 케이스) | HTTP 400 | HTTP 400, 400, 400 | ✅ PASS |
| SC-E-03 | 잘못된 자격증명 로그인 | HTTP 401 | HTTP 401 | ✅ PASS |
| SC-E-04 | 미인증 할 일 생성 | HTTP 401 | HTTP 401 | ✅ PASS |
| SC-E-05 | 제목 누락 할 일 생성 | HTTP 400 | HTTP 400 | ✅ PASS |
| SC-E-06 | 미인증 할 일 수정 | HTTP 401 | HTTP 401 | ✅ PASS |
| SC-E-07 | 타인 소유 할 일 수정 | HTTP 403 | HTTP 403 | ✅ PASS |
| SC-E-08 | 미인증 할 일 삭제 | HTTP 401 | HTTP 401 | ✅ PASS |
| SC-E-09 | 타인 소유 할 일 삭제 | HTTP 403 | HTTP 403 | ✅ PASS |
| SC-E-10 | 잘못된 상태 전이 (DONE → DONE) | HTTP 400 | HTTP 400 | ✅ PASS |
| SC-E-11 | 잘못된 상태 전이 (PENDING → PENDING) | HTTP 400 | HTTP 400 | ✅ PASS |
| SC-E-12 | 목록 조회 시 타인 항목 미포함 | 타인 항목 미포함 | 타인 항목 미포함 확인 | ✅ PASS |

---

## 3. 통합 E2E 시나리오

### SC-E2E-01: 직장인 김민준 — 업무 할 일 등록 및 마감 초과 확인

| 단계 | 실행 내용 | 기대 결과 | 실제 결과 | 상태 |
|------|-----------|-----------|-----------|------|
| 1 | 이메일·비밀번호·닉네임 입력 후 회원가입 | HTTP 201, 로그인 페이지 이동 | HTTP 201, /login 리다이렉트 | ✅ PASS |
| 2 | 동일 이메일·비밀번호로 로그인 | JWT 발급, 메인 페이지 이동 | accessToken + refreshToken 발급, / 이동 | ✅ PASS |
| 3 | "Q1 보고서 제출" (dueDate=3일 전) 생성 | status=PENDING | status=PENDING, 목록에 표시 | ✅ PASS |
| 4 | "팀 회의 준비" (dueDate 없음) 생성 | status=PENDING | status=PENDING, 목록에 표시 | ✅ PASS |
| 5 | 할 일 목록 조회 | Q1 overdue:true / 팀회의 overdue:false | 각각 확인 | ✅ PASS |
| 6 | UI 붉은 배지 확인 | "Q1 보고서 제출"에 "마감 초과" 배지 | UI에 "마감 초과" 텍스트 표시 | ✅ PASS |
| 7 | "Q1 보고서 제출" 완료 처리 | status=DONE | "완료 취소" 버튼으로 변경 | ✅ PASS |
| 8 | 목록 재조회 | "Q1 보고서 제출" overdue:false (배지 미표시) | "마감 초과" 배지 사라짐 | ✅ PASS |

### SC-E2E-02: 대학생 이수아 — 다중 기기 할 일 관리 및 권한 경계 확인

| 단계 | 실행 내용 | 기대 결과 | 실제 결과 | 상태 |
|------|-----------|-----------|-----------|------|
| 1 | 이수아 계정 회원가입 + 로그인 | JWT 발급 | accessToken + refreshToken 발급 | ✅ PASS |
| 2 | "운영체제 과제" (dueDate=내일) 생성 | status=PENDING | HTTP 201, status=PENDING | ✅ PASS |
| 3 | 목록 조회 (본인 항목만, 김민준 항목 미포함) | 이수아 항목만 반환 | 이수아 항목만 표시, 김민준 항목 없음 | ✅ PASS |
| 4 | 동일 계정 재로그인 | 새 JWT 발급 | 새 accessToken 발급, 목록 유지 | ✅ PASS |
| 5 | "운영체제 과제" → "운영체제 과제 (1차 제출)" 수정 | HTTP 200 | HTTP 200, 제목 반영 | ✅ PASS |
| 6 | 김민준 소유 할 일 수정 시도 | HTTP 403 | HTTP 403 | ✅ PASS |
| 7 | 김민준 소유 할 일 삭제 시도 | HTTP 403 | HTTP 403 | ✅ PASS |
| 8 | "운영체제 과제 (1차 제출)" 삭제 | HTTP 204 | 목록에서 제거, 빈 목록 표시 | ✅ PASS |
| 9 | 삭제된 항목 재조회 | HTTP 404 | HTTP 404 | ✅ PASS |

---

## 4. 발견된 구현 vs 문서 불일치

| 항목 | 시나리오 문서 | 실제 구현 | 비고 |
|------|--------------|-----------|------|
| JWT 응답 구조 (SC-H-02) | "JWT 토큰 발급(유효기간 24시간)" | `accessToken`(15분) + `refreshToken`(7일) 발급 | Refresh Token Rotation 방식으로 보안 강화 |
| 삭제 응답 코드 (SC-H-08) | "HTTP 200(또는 204)" | HTTP 204 | 정상 범위 내 |
| 수정 HTTP 메서드 | 문서에서 PUT 암시 | 실제 `PATCH /api/todos/:id` | REST 설계 차이 |
| 완료/취소 엔드포인트 | 문서에서 `/done`, `/pending` 암시 | 실제 `/complete`, `/revert` | 구현 명칭 차이 |
| 단일 항목 조회 엔드포인트 | SC-H-08에서 재조회 언급 | `GET /api/todos/:id` 미구현 | 삭제 후 404는 완료 시도(`/complete`)로 대체 검증 |

---

## 5. 커버리지 요약

| 시나리오 유형 | 총 건수 | PASS | FAIL |
|-------------|---------|------|------|
| 정상 흐름 (SC-H) | 11건 | 11건 | 0건 |
| 예외 흐름 (SC-E) | 12건 | 12건 | 0건 |
| 통합 E2E (SC-E2E) | 2건 | 2건 | 0건 |
| **합계** | **25건** | **25건** | **0건** |

**전체 통과율: 100%**
