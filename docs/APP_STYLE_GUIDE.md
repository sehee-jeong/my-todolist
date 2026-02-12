# UI 스타일 가이드: my-todolist

## 문서 정보

| 항목 | 내용 |
|------|------|
| 버전 | v1.0 |
| 작성일 | 2026-02-11 |
| 근거 문서 | PRD v1.0 §6, 도메인 정의서 v1.2 §3 |
| 참고 디자인 | Google Calendar (2026-02-11 캡처) |

---

## 색상 토큰

| 토큰 | Hex | 용도 |
|------|-----|------|
| `--color-primary` | `#1A73E8` | Primary 버튼, 포커스 테두리, 오늘 날짜 배지, 링크 |
| `--color-primary-hover` | `#1557B0` | Primary 버튼 hover |
| `--color-primary-bg` | `#E8F0FE` | 선택된 탭/뷰 버튼 배경, 활성 아이콘 배경 |
| `--color-done` | `#33B679` | DONE 상태 강조색 (체크 아이콘, 완료 배지) |
| `--color-danger` | `#D32F2F` | Overdue 테두리·배지, 에러 메시지 |
| `--color-danger-bg` | `#FFEBEE` | Danger 버튼 hover 배경 |
| `--color-bg-page` | `#F1F3F4` | 페이지 배경 |
| `--color-bg-card` | `#FFFFFF` | 카드·폼 배경 |
| `--color-border` | `#DADCE0` | 카드 테두리, 입력 필드 테두리, 그리드 구분선 |
| `--color-border-focus` | `#1A73E8` | 포커스 시 입력 필드 테두리 |
| `--color-text-primary` | `#3C4043` | 본문 텍스트, 레이블 |
| `--color-text-secondary` | `#5F6368` | 설명·보조 텍스트, 마감일 |
| `--color-text-done` | `#9E9E9E` | DONE 항목 제목 (취소선) |
| `--color-text-on-primary` | `#FFFFFF` | Primary 버튼 텍스트 |
| `--color-text-on-danger` | `#FFFFFF` | Danger 배지 텍스트 |

### 변경 전/후 대조

| 항목 | 변경 전 | 변경 후 |
|------|---------|---------|
| Primary | `#1976D2` | `#1A73E8` |
| Primary hover | `#1565C0` | `#1557B0` |
| Secondary bg | `#E0E0E0` | `#F1F3F4` |
| Page bg | `#F5F5F5` | `#F1F3F4` |
| Card border | `#E0E0E0` | `#DADCE0` |
| Text primary | `#212121` | `#3C4043` |
| Text secondary | `#616161` | `#5F6368` |
| Button radius | `6px` | `20px` (pill) |
| DONE 강조색 | — | `#33B679` (완료 배지) |

---

## 타이포그래피

| 역할 | 크기 | 굵기 | 색상 토큰 |
|------|------|------|-----------|
| 페이지 제목 (`h1`) | `1.375rem` | 400 | `--color-text-primary` |
| 카드 제목 | `1rem` | 500 | `--color-text-primary` |
| 레이블 | `0.875rem` | 500 | `--color-text-primary` |
| 본문 | `0.875rem` | 400 | `--color-text-secondary` |
| 마감일·메타 | `0.8rem` | 400 | `--color-text-secondary` |
| 에러 메시지 | `0.875rem` | 400 | `--color-danger` |
| 배지 | `0.75rem` | 600 | `--color-text-on-danger` |

---

## 컴포넌트 스펙

### 버튼

| 종류 | 배경 | 텍스트 | 테두리 | hover 배경 |
|------|------|--------|--------|------------|
| Primary | `#1A73E8` | `#FFFFFF` | 없음 | `#1557B0` |
| Secondary | `#F1F3F4` | `#3C4043` | 없음 | `#DADCE0` |
| Danger (아웃라인) | `#FFFFFF` | `#D32F2F` | 1px `#D32F2F` | `#FFEBEE` |
| Ghost (텍스트) | 투명 | `#1A73E8` | 없음 | `#E8F0FE` |

- `border-radius`: `20px` (pill shape, Google Calendar 스타일)
- `padding`: `8px 16px`
- `min-height`: `36px` (데스크탑), `44px` (모바일)
- `font-size`: `0.875rem`, `font-weight: 500`

### 입력 필드

- `border`: `1px solid #DADCE0`
- `border-radius`: `4px`
- `padding`: `10px 12px`
- `focus` → `border-color: #1A73E8` + `box-shadow: 0 0 0 2px #E8F0FE`

### 카드 (할 일 아이템)

- `background`: `#FFFFFF`
- `border`: `1px solid #DADCE0`
- `border-radius`: `8px`
- `box-shadow`: `0 1px 2px rgba(60, 64, 67, 0.10)`
- Overdue: `border: 2px solid #D32F2F`
- DONE: `background: #F8F9FA`, `opacity: 0.75`

### 아이템 상태 스타일

| 상태 | 테두리 | 배지 | 제목 | 배경 |
|------|--------|------|------|------|
| PENDING | 기본 (#DADCE0) | 없음 | 기본 | 흰색 |
| PENDING + Overdue | 붉은색 2px (#D32F2F) | `마감 초과` (붉은 배지) | 기본 | 흰색 |
| DONE | 기본 | 없음 | ~~취소선~~ + 회색 | 연회색, 투명도 0.75 |

### 오늘 날짜 배지

```
  ┌────────────────────────────────────────────────────┐
  │  ●  오늘 날짜 원형 배지: 28px × 28px               │
  │     background: #1A73E8 / color: #FFFFFF            │
  │     border-radius: 50%                              │
  └────────────────────────────────────────────────────┘
```

---

## 공통 UX 컴포넌트

### 오류 메시지 위치 원칙

```
┌──────────────────────────────┐
│  필드 레이블                 │
│  ┌──────────────────────┐    │
│  │ 입력값               │    │
│  └──────────────────────┘    │
│  ⚠ 인라인 오류 메시지        │  ← 폼 내 오류: 필드 하단 또는 버튼 상단
└──────────────────────────────┘

┌──────────────────────────────────────────────┐
│                                              │
│   ┌──────────────────────────┐               │
│   │ ⚠ 이미 완료된 항목입니다. │  (토스트)    │  ← 400 상태 전이 오류
│   └──────────────────────────┘               │
└──────────────────────────────────────────────┘
```

### 반응형 분기 (모바일 ≤ 480px)

```
데스크탑                          모바일
┌──────────────────────────────┐  ┌──────────────────┐
│ 제목    [완료] [수정] [삭제] │  │ 제목             │
└──────────────────────────────┘  │ 마감: YYYY-MM-DD │
                                  ├──────────────────┤
                                  │[완료][수정][삭제]│  ← 버튼 가로 배열
                                  └──────────────────┘

헤더:
┌─────────────────────────────┐  ┌──────────────────┐
│ 내 할 일  [+추가] [로그아웃]│  │ 내 할 일         │
└─────────────────────────────┘  │ [+추가] [로그아웃]│
                                  └──────────────────┘
```
