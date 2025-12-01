# Fanding Platform - 전체 시나리오 구현 계획

## 📋 목표 시나리오

### Phase 1: 뮤지션 온보딩 (Musician Onboarding)
1. 사용자가 웹사이트에 접속
2. "뮤지션으로 시작" 버튼 클릭
3. MetaMask 지갑 연결 (Ethereum Sepolia Testnet)
4. 프로필 정보 입력 (뮤지션명, 장르)
5. 토큰 배포 (ERC-20)
6. 토큰 배포 완료 후 대시보드 표시

### Phase 2: 뮤지션 활동 (Musician Activity)
1. 배포한 토큰의 상세페이지 접속
2. 투표(Poll) 하나 생성
3. 근황 게시글(Post) 하나 등록
4. 팬들이 볼 수 있도록 공개

### Phase 3: 팬 온보딩 (Fan Onboarding)
1. 다른 지갑으로 웹사이트 접속
2. 토큰 갤러리에서 뮤지션 찾기
3. 뮤지션 토큰 구매

### Phase 4: 팬 활동 (Fan Activity)
1. 팬 지갑으로 토큰 소유 확인
2. 뮤지션이 올린 투표에 참여
3. 투표 결과 확인

---

## ✅ 현재 상태 (Implementation Status)

### 백엔드 (Backend)
#### ✅ 완료된 기능
- [x] 뮤지션 프로필 생성 API (`POST /api/musicians/signup`)
- [x] 토큰 배포 API (`POST /api/musicians/:id/deploy-token`)
- [x] 토큰 정보 조회 API (`GET /api/musicians/:id/token`)
- [x] 뮤지션 대시보드 API (`GET /api/musicians/:id/dashboard`)
- [x] 뮤지션 목록 및 검색 API (`GET /api/musicians`, `/musicians/search`)
- [x] 토큰 구매 API (`POST /api/tokens/:id/purchase`)
- [x] 구매 이력 조회 API (`GET /api/tokens/fan/:wallet/history`)
- [x] 투표 생성 API (`POST /api/governance`)
- [x] 투표 조회 API (`GET /api/governance/:id`)
- [x] 투표 결과 조회 API (`GET /api/governance/:id/results`)
- [x] 투표 참여 API (`POST /api/governance/:id/vote`)
- [x] 게시글 생성 API (`POST /api/posts`)
- [x] 게시글 조회 API (`GET /api/posts/:musicianId`)
- [x] 게시글 수정/삭제 API (`PUT/DELETE /api/posts/:postId`)
- [x] 댓글 기능 API

#### ❌ 미구현된 기능
- [ ] 팬의 토큰 보유 검증 (Fan Token Verification)
- [ ] 토큰 보유량 기반 투표 권한 확인
- [ ] 투표 참여 시 팬 인증 프로세스

### 프론트엔드 (Frontend)
#### ✅ 완료된 기능
- [x] MetaMask 지갑 연결 (Ethereum Sepolia)
- [x] 뮤지션 가입 페이지 (프로필 입력)
- [x] 토큰 배포 진행상황 표시 (4단계)
- [x] 토큰 갤러리 및 검색
- [x] 토큰 상세페이지 (투표 & 근황 탭)
- [x] 투표 생성 폼 (CreatePollForm)
- [x] 투표 리스트 및 결과 표시
- [x] 토큰 구매 폼
- [x] 데모 데이터 표시

#### ❌ 미구현된 기능
- [ ] 게시글 생성 UI (근황 게시글 작성)
- [ ] 게시글 리스트 표시 (근황 피드)
- [ ] 투표 참여 UI (팬의 투표 인터페이스)
- [ ] 팬 인증 및 토큰 검증 UI
- [ ] 뮤지션 대시보드 (작성한 투표/게시글 관리)
- [ ] 구매 이력 페이지

---

## 🛠️ Phase별 구현 계획

### Phase 1: 뮤지션 온보딩 (Musician Onboarding) ✅
**상태**: 대부분 완료, 미세 조정 필요

#### 필요한 작업
1. **토큰 배포 후 UX 개선**
   - 배포 완료 후 자동으로 대시보드로 이동
   - 게시글/투표 생성 버튼 쉽게 접근 가능
   - 상세 페이지로의 빠른 링크 제공

2. **오류 처리 강화**
   - 배포 실패 시 재시도 로직
   - 명확한 에러 메시지 표시

#### 파일
- Frontend: `App.tsx`, `MusicianSignupForm.tsx`, `TokenDeploymentStatus.tsx`
- Backend: 모두 완료

---

### Phase 2: 뮤지션 활동 (Musician Activity) ⚠️
**상태**: 부분 완료

#### 필요한 작업

##### A. 투표 생성 (Poll Creation) ✅
**상태**: 완료
- `CreatePollForm.tsx` - 3단계 폼
- 백엔드 API - 모두 구현됨

##### B. 게시글 생성 (Post Creation) ❌
**상태**: 백엔드만 완료, 프론트엔드 필요

**필요한 컴포넌트**:
1. `CreatePostForm.tsx` - 게시글 작성 폼
   - 제목 입력
   - 본문 입력
   - 이미지 업로드
   - 취소/저장 버튼

2. `PostFeed.tsx` - 게시글 목록 표시
   - 게시글 리스트
   - 각 게시글: 제목, 본문, 이미지, 좋아요, 댓글
   - 게시글 수정/삭제 기능

3. `PostCard.tsx` - 게시글 카드 컴포넌트
   - 작성자 정보
   - 작성 시간
   - 좋아요 버튼
   - 댓글 표시

#### 구현 순서
1. `CreatePostForm.tsx` 만들기
2. TokenDetail 페이지에 게시글 작성 버튼 추가
3. TokenDetail에 `PostFeed.tsx` 통합
4. 게시글 수정/삭제 기능 추가

---

### Phase 3: 팬 온보딩 (Fan Onboarding) ✅
**상태**: 완료

#### 완료된 작업
- TokenGallery - 토큰 갤러리 검색
- TokenPurchaseForm - 토큰 구매 폼
- MetaMask 다중 계정 지원

#### 추가 필요 작업
- 구매 성공 후 UX 개선
- 토큰 보유 확인 메시지

---

### Phase 4: 팬 활동 (Fan Activity) ⚠️
**상태**: 부분 완료

#### 필요한 작업

##### A. 토큰 보유 검증 (Token Verification) ❌
**필요 기능**:
1. 팬의 지갑 주소 확인
2. 해당 뮤지션 토큰 보유량 조회
3. 보유량이 0 초과 확인

**구현 방식**:
- 백엔드: 투표 참여 API에서 토큰 보유 검증 추가
- 프론트엔드: 투표 참여 전 검증 UI 추가

##### B. 투표 참여 UI (Voting Interface) ❌
**필요한 컴포넌트**:

1. `VoteInterface.tsx` - 팬의 투표 인터페이스
   - 토큰 보유 확인
   - 투표 옵션 선택
   - 투표 제출 버튼
   - 투표 완료 메시지

2. `TokenVerification.tsx` - 토큰 검증
   - 팬 지갑 확인
   - 토큰 보유량 표시
   - "투표 자격 있음" / "토큰 구매 필요" 메시지

**구현 순서**:
1. TokenDetail 페이지에서 팬인지 확인
2. 팬이면 VoteInterface 표시
3. 투표 전 토큰 보유 검증
4. 투표 완료 후 결과 새로고침

---

## 📊 상세 구현 체크리스트

### Backend
- [x] Musician API (생성, 조회, 수정)
- [x] Token Deployment (배포, 조회)
- [x] Token Purchase (구매, 이력)
- [x] Governance Poll (생성, 조회, 투표)
- [x] Post API (생성, 조회, 수정, 삭제, 댓글)
- [ ] **팬 토큰 검증 로직 추가** ← 필요
  - POST /api/governance/:id/vote 에 토큰 검증 추가
  - POST /api/tokens/verify-ownership API 추가 (선택)
- [ ] **투표 권한 확인** ← 필요
  - 토큰 보유 확인
  - 투표 완료 여부 확인
  - 투표력 계산 (quadratic voting)

### Frontend

#### 게시글 기능
- [ ] `CreatePostForm.tsx` 만들기
- [ ] `PostFeed.tsx` 만들기
- [ ] `PostCard.tsx` 만들기
- [ ] TokenDetail에 게시글 탭 통합
- [ ] 게시글 수정/삭제 UI

#### 투표 참여 기능
- [ ] `VoteInterface.tsx` 만들기
- [ ] `TokenVerification.tsx` 만들기
- [ ] TokenDetail에 투표 인터페이스 통합
- [ ] 투표 전 토큰 검증 로직
- [ ] 투표 완료 후 UI 업데이트

#### 뮤지션 대시보드
- [ ] `MusicianDashboard.tsx` 만들기
- [ ] 작성한 투표 목록
- [ ] 작성한 게시글 목록
- [ ] 팬 구매 이력
- [ ] 분석 데이터 (투표율, 팬 수 등)

#### UX 개선
- [ ] 토큰 배포 완료 후 대시보드 자동 이동
- [ ] 게시글/투표 작성 후 새로고침
- [ ] 에러 처리 UI 개선
- [ ] 로딩 상태 UI 개선

---

## 🔄 구현 순서 (우선순위)

### 1순위: Phase 2 완료 (뮤지션 활동)
- 게시글 작성 UI 만들기
- 게시글 피드 표시하기
- 투표는 이미 완료됨

### 2순위: Phase 4 완료 (팬 활동)
- 토큰 검증 로직
- 투표 참여 UI
- 투표 권한 확인

### 3순위: 사용성 개선
- 뮤지션 대시보드
- 구매 이력 페이지
- 오류 처리 강화

---

## 🎯 각 Phase 완료 기준

### Phase 1 ✅
**기준**:
- [ ] 뮤지션 가입 성공
- [ ] 토큰 배포 성공 (Etherscan에서 확인 가능)
- [ ] TokenDetail 페이지에서 토큰 정보 표시

### Phase 2 ⚠️
**기준**:
- [ ] 투표 생성 성공
- [ ] 게시글 작성 성공
- [ ] TokenDetail 페이지에서 투표와 게시글 표시

### Phase 3 ✅
**기준**:
- [ ] 다른 지갑으로 접속 가능
- [ ] 토큰 구매 성공 (Polygon Amoy에서 확인 가능)
- [ ] 팬 지갑에 토큰 표시

### Phase 4 ⚠️
**기준**:
- [ ] 팬이 토큰 보유 여부 확인 가능
- [ ] 팬이 투표에 참여 가능
- [ ] 투표 결과에 팬의 투표 반영

---

## 📝 파일 변경 예상도

### 새로 만들 파일
1. `components/CreatePostForm.tsx` (150-200줄)
2. `components/PostFeed.tsx` (120-150줄)
3. `components/PostCard.tsx` (100-120줄)
4. `components/VoteInterface.tsx` (150-200줄)
5. `components/TokenVerification.tsx` (100-120줄)
6. `components/MusicianDashboard.tsx` (200-250줄)

### 수정할 파일
1. `App.tsx` - 새로운 뷰 모드 추가 (dashboard-full)
2. `TokenDetail.tsx` - 게시글 탭 및 투표 인터페이스 추가
3. `api.ts` - 새로운 API 호출 메서드 추가
4. `TokenDeploymentStatus.tsx` - 완료 후 대시보드 이동

### 백엔드 수정 파일
1. `src/routes/governance.ts` - 투표 전 토큰 검증 추가
2. `src/services/governanceService.ts` - 토큰 검증 로직 추가

---

## 🔐 주의사항

### 보안
- 투표 권한: 토큰 보유자만 투표 가능
- 중복 투표 방지: 같은 사용자가 한 번만 투표
- 지갑 검증: 모든 거래에서 지갑 주소 확인

### 테스팅
- 같은 지갑으로 토큰 배포 후 토큰 구매 불가 확인
- 다른 지갑으로 토큰 구매 및 투표 참여 확인
- 토큰 없는 지갑의 투표 차단 확인

### 네트워크
- Ethereum Sepolia Testnet - 뮤지션 토큰
- Polygon Amoy Testnet - 팬 토큰 구매
- 두 네트워크 자동 전환 필요

---

## 📅 예상 일정

| 단계 | 작업 | 예상 시간 |
|------|------|----------|
| 1 | 게시글 UI 만들기 | 1-2시간 |
| 2 | 투표 참여 UI 만들기 | 1-2시간 |
| 3 | 토큰 검증 로직 추가 | 1시간 |
| 4 | 백엔드 토큰 검증 추가 | 1시간 |
| 5 | 통합 테스트 | 1-2시간 |
| 6 | 버그 수정 및 최적화 | 1시간 |
| **총계** | | **6-9시간** |

---

## 🚀 다음 단계

이 계획서에 따라 다음 순서로 진행합니다:

1. **게시글 UI 컴포넌트 만들기** (CreatePostForm, PostFeed, PostCard)
2. **TokenDetail에 게시글 통합**
3. **투표 참여 UI 만들기** (VoteInterface, TokenVerification)
4. **백엔드 토큰 검증 로직 추가**
5. **전체 통합 테스트**

---

**상태**: 초안 작성 완료  
**마지막 업데이트**: 2025-12-01  
**진행률**: 60% (12/20 기능 완료)
