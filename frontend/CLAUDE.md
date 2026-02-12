# Frontend CLAUDE.md

## 프로젝트 개요

React 19 + TypeScript 기반 Todo 앱 프론트엔드. Vite 7로 빌드, React Router DOM 7로 라우팅.

## 기술 스택

- **React 19** + **TypeScript 5.9** (strict mode)
- **Vite 7** (dev server, 빌드)
- **React Router DOM 7** (클라이언트 라우팅)
- **Vitest v4** + **@testing-library/react** + **happy-dom** (테스트)
- **@vitest/coverage-istanbul** (커버리지 provider)

## 디렉토리 구조

```
src/
├── pages/           # 페이지 컴포넌트 (LoginPage, SignupPage, TodoListPage, TodoNewPage, TodoEditPage)
├── components/
│   └── todo/        # 재사용 컴포넌트 (TodoItem)
├── hooks/           # 커스텀 훅 (useTodos)
├── services/        # API 서비스 레이어
│   ├── apiClient.ts     # fetch 래퍼, 401 자동 처리
│   ├── authService.ts   # 회원가입/로그인/로그아웃/토큰
│   └── todoService.ts   # Todo CRUD
├── types/           # TypeScript 타입 정의
│   ├── todo.types.ts
│   └── member.types.ts
└── test/            # 테스트 (services/, hooks/, components/, pages/)
```

## 개발 명령어

```bash
npm run dev          # 개발 서버 (포트 5173, /api → localhost:3000 프록시)
npm run build        # 프로덕션 빌드
npm run test         # 테스트 단발 실행
npm run test:watch   # 테스트 watch 모드
npm run test:coverage # 커버리지 리포트
npm run lint         # ESLint 검사
```

## 코딩 규칙

### TypeScript
- `strict: true` + `noUnusedLocals`, `noUnusedParameters` 활성화 — 미사용 변수 선언 금지
- `erasableSyntaxOnly: true` — `enum`, `namespace` 사용 불가; `type` 키워드로 import
- 타입은 `src/types/` 에 모아서 관리

### React Hooks
- **모든 `useState`/`useEffect` 선언은 컴포넌트 최상단에** 위치해야 함
- 조건부 early return 이전에 훅 선언 완료 (LoginPage, SignupPage 패턴 참고)

### CSS
- CSS 변수(`--color-*`)와 유틸리티 클래스를 `src/index.css` 에서 관리
- BEM 유사 클래스 네이밍: `.todo-item`, `.todo-item--done`, `.todo-item__title`
- 버튼 클래스: `btn btn--primary` / `btn--secondary` / `btn--danger`
- 레이아웃: `page-container`, `page-header`, `auth-container`, `form-group`
- 모바일(≤480px): `.btn` min-height 44px 적용

## 인증 흐름

- `accessToken` / `refreshToken` 을 `localStorage` 에 저장
- `apiClient.ts` 에서 모든 요청에 `Authorization: Bearer <accessToken>` 자동 첨부
- 401 응답 시 두 토큰 모두 제거 후 `/login` 으로 리다이렉트
- `ProtectedRoute` 컴포넌트(`App.tsx`)가 `getToken()` 으로 접근 제어

## API 통신 패턴

```ts
// apiClient.request<T>(path, options?) 사용
const todos = await apiClient.request<Todo[]>('/todos');
await apiClient.request('/todos', { method: 'POST', body: JSON.stringify(dto) });
```

- BASE_URL: `/api` (Vite 프록시로 `http://localhost:3000` 으로 전달)
- 204 응답은 `undefined` 반환

## 테스트 설정

- 환경: `happy-dom` (`jsdom` v28은 ESM 호환 문제로 사용 불가)
- setupFiles: `src/test/setup.ts` (`@testing-library/jest-dom` import)
- globals: `true` (describe/it/expect 등 전역 사용 가능)
- 커버리지 임계값: lines/functions/branches/statements 모두 **80%**

### 테스트 작성 주의사항

| 상황 | 올바른 방법 |
|------|------------|
| `window.alert` / `window.confirm` 모킹 | `vi.stubGlobal('alert', vi.fn())` (spyOn 사용 불가) |
| `fetch` 모킹 | `vi.stubGlobal('fetch', vi.fn())` |
| HTML5 `required` 폼 빈 값 제출 | `fireEvent.submit(form)` (userEvent.click은 브라우저 검증에 막힘) |
| 로그인 버튼 선택 | `getByRole('button', { name: '로그인' })` (h1과 텍스트 중복) |
| 테스트 후 전역 복원 | `afterEach(() => vi.unstubAllGlobals())` |

### 서비스 모킹 패턴

```ts
vi.mock('../../services/authService', () => ({
  login: vi.fn(),
  logout: vi.fn(),
  getToken: vi.fn(),
}));
```

## 라우트 구조

| 경로 | 컴포넌트 | 보호 |
|------|----------|------|
| `/signup` | SignupPage | 공개 |
| `/login` | LoginPage | 공개 |
| `/` | TodoListPage | 인증 필요 |
| `/todos/new` | TodoNewPage | 인증 필요 |
| `/todos/:id/edit` | TodoEditPage | 인증 필요 |
