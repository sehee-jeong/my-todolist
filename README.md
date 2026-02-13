# My Todolist

할 일을 관리하는 풀스택 웹 애플리케이션입니다.

## 서비스 주소

- **프론트엔드:** https://my-todolist-app.vercel.app
- **백엔드 API:** https://my-todolist-api.vercel.app
- **API 문서:** https://my-todolist-api.vercel.app/docs

## 기술 스택

| 구분 | 기술 |
|------|------|
| Frontend | React 19, TypeScript, Vite |
| Backend | Node.js, Express, TypeScript |
| Database | PostgreSQL 17 (Supabase) |
| 배포 | Vercel |

## 주요 기능

- 회원가입 / 로그인 (JWT Access Token + Refresh Token)
- 할 일 추가 / 수정 / 삭제
- 마감일 설정 (날짜 + 시간)
- 전체 / 진행 중 / 완료 탭 필터
- 다크모드 / 라이트모드 / 시스템 테마
- 한국어 / 영어 / 일본어 다국어 지원

## 로컬 실행

### 사전 요구사항

- Node.js 18+
- PostgreSQL 17

### 백엔드

```bash
cd backend
cp .env.example .env  # 환경변수 설정
npm install
npm run dev
```

### 프론트엔드

```bash
cd frontend
cp .env.example .env  # 환경변수 설정
npm install
npm run dev
```

## 환경변수

### 백엔드 (`backend/.env`)

```
DATABASE_URL=postgresql://...
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
CORS_ORIGIN=http://localhost:5173
```

### 프론트엔드 (`frontend/.env`)

```
VITE_API_URL=http://localhost:3000
```

## 테스트

```bash
# 백엔드 (35개)
cd backend && npm test

# 프론트엔드 (84개)
cd frontend && npm test
```
