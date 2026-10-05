# 오운완 프로젝트 최종 문서

이 프로젝트는 운동 루틴 관리, 오늘의 체크, 캘린더 기록, 휴식 타이머, AI 운동 코치 기능을 포함한 웹 앱입니다. 현재 구조는 Next.js 기반으로 동작하고 있으며, 로컬 Ollama를 활용한 AI 상담 기능을 기본으로 구성되어 있습니다.

## 1. 프로젝트 개요

- 앱 이름: 오운완
- 핵심 목적: 운동 루틴을 관리하고, 오늘의 운동을 체크하며, 운동 계획을 유지할 수 있도록 돕는 앱
- 주요 기능:
  - 요일별 루틴 편집
  - 운동 세트 체크 및 완료 상태 관리
  - 오늘 운동 완료 시 스탬프 적립
  - 월간 캘린더 기록
  - 자동 휴식 타이머
  - AI 운동 상담 기능

## 2. 기술 스택

- Frontend: Next.js 16, React 19, TypeScript
- Styling: Tailwind CSS
- AI: Ollama (local)
- Fallback: Google Gemini (비상용)
- Runtime: Node.js

## 3. 주요 기능

### 3.1 루틴 관리
- 요일별 운동 목록 관리
- 운동 추가, 수정, 삭제
- 무게, 세트 수, 반복 수, 휴식 시간 설정
- 세트별 완료 상태 체크

### 3.2 오늘 운동 체크
- 각 요일 루틴을 완료 상태로 관리
- 모든 운동 체크 후 스탬프 획득 가능
- 완료 기준 검증 로직 포함

### 3.3 달력/기록
- 월간 캘린더 형태로 스탬프 표시
- 완료일 시 시각적으로 표시
- 연속 기록 수 노출

### 3.4 AI 컨설턴트
- 우측 하단 FAB 형태의 AI 버튼
- 채팅형 상담 UI
- 루틴 상태와 오늘의 운동 정보를 프롬프트에 반영
- 로컬 Ollama를 우선 사용
- 로컬 서버가 없을 경우 fallback 메시지 제공

## 4. 디렉터리 구조

```text
src/
  app/
    api/
      ai-consultant/route.ts
    page.tsx
  components/
  data/
  domain/
  screens/
  services/
  stores/
  utils/
```

핵심 파일:
- src/app/page.tsx: 메인 UI 및 탭, AI 채팅, 루틴 및 캘린더 화면
- src/app/api/ai-consultant/route.ts: AI 서버 라우트. Ollama 호출 및 fallback 처리
- src/utils/date.ts: 요일 계산 및 날짜 포맷 관련 로직
- src/screens/calendar/useCalendarViewModel.ts: 캘린더용 상태 로직
- src/screens/today/useTodayViewModel.ts: 오늘 루틴 표시 로직

## 5. AI 설정 방식

### 로컬 Ollama 사용 설정

.env.local 예시:

```env
GOOGLE_API_KEY=...
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=qwen2.5:7b-instruct
```

### Ollama 실행 순서

```powershell
& "C:\Users\AERO\AppData\Local\Programs\Ollama\ollama.exe" serve
& "C:\Users\AERO\AppData\Local\Programs\Ollama\ollama.exe" pull qwen2.5:7b-instruct
```

또는 더 단순한 모델 사용 시:

```powershell
& "C:\Users\AERO\AppData\Local\Programs\Ollama\ollama.exe" pull llama3.2
```

## 6. 실행 방법

```bash
npm install
npm run dev
```

브라우저 접속:
- 로컬: http://localhost:3000
- 모바일: http://192.168.219.106:3000 (같은 네트워크에서 접속 가능)

## 7. 검증 사항

다음 검증은 실제로 수행되었고 성공했습니다.

- TypeScript 체크: `npx tsc --noEmit`
- Ollama 연결 확인: `curl.exe -sS http://localhost:11434/api/tags`
- 로컬 모델 테스트: qwen2.5:7b-instruct 직접 호출 확인

## 8. 주요 문제 해결 기록

### 8.1 요일 및 스탬프 버그
- JavaScript의 Date.getDay()는 일요일을 0으로 계산하는 구조였음
- 앱 로직은 월요일을 0으로 가정하고 있었기 때문에 월요일이 화요일로 표시되는 문제가 발생
- 공용 날짜 유틸 함수로 Monday-first 로직을 정리하여 수정

### 8.2 AI provider 불안정성
- Gemini가 404, 503, 429 같은 외부 응답 오류를 발생시킴
- 무료 quota 한계, 모델 이름 변경, 서버 상태 문제 등이 원인이었음
- 프로젝트는 로컬 Ollama를 우선 사용하도록 전환

### 8.3 UI 레이아웃 정리
- 루틴 탭과 캘린더 탭의 너비 차이를 정렬
- AI FAB 버튼을 화면 우측 하단 안쪽으로 이동
- 모바일 뷰에서 자연스럽게 보이도록 폭과 여백 조정

## 9. 참고사항

- 현재 앱은 로컬 개발용 환경을 기준으로 설계됨
- 실제 서비스 배포 시에는 환경 변수 및 보안 설정을 별도로 정리해야 함
- AI 응답 품질은 선택한 Ollama 모델 성능에 따라 달라짐

## 10. 향후 개선 아이디어

- AI 대화 로그 저장
- 루틴 추천 및 운동 계획 자동 생성
- 사용자별 운동 이력 학습
- OpenAPI/외부 모델 provider fallback 고도화
- PWA 기반 모바일 최적화

## 11. 결론

이 프로젝트는 단순한 운동 기록 앱을 넘어서, 하루 루틴 관리와 AI 코칭을 함께 제공하는 실사용형 모바일형 운동 어플리케이션으로 완성 단계에 도달했습니다. 로컬 AI 기반으로 동작하도록 정리되어 있어, 외부 API 의존성 없이도 개인용 운동 코치 경험을 제공할 수 있습니다.

