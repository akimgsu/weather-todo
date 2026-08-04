# 📝 나의 첫 메모장 (Weather Todo App)

React Native 생태계의 최신 기술(Expo Router, Firebase Authentication, Firestore, Location API)을 활용하여 구축한 **실시간 위치 기반 유저 개인화 메모장 앱**입니다.

---

## ✨ 주요 기능 및 특징

1. **🔐 Firebase 이메일/비밀번호 로그인 (유저별 데이터 격리)**
   - 이메일 및 비밀번호 기반 회원가입, 로그인, 로그아웃 기능.
   - 각 유저별 고유 ID(`userId: user.uid`)로 데이터를 저장하고 필터링하여 **나만의 개별 메모장** 제공.
2. **🌤️ 실시간 위치 기반 날씨 및 단위 토글 (℃ / ℉)**
   - `expo-location`을 통한 사용자의 현재 위치(위도/경도 및 동네 이름) 자동 감지.
   - `Open-Meteo API` 기반 무료 실시간 날씨 정보 연동.
   - 버튼 클릭 한 번으로 **섭씨(℃) ↔ 화씨(℉)** 실시간 단위 변환 기능.
3. **💾 Firestore 실시간 클라우드 동기화**
   - 앱을 껐다 켜거나 기기를 변경해도 데이터 영구 보관.
   - `onSnapshot` 기반 실시간 반응형 동기화로 여러 브라우저/기기 간 즉시 데이터 갱신.
4. **🎨 3D 커스텀 앱 아이콘**
   - 날씨와 메모장 컨셉을 반영한 세련된 3D 커스텀 앱 아이콘 적용 (`assets/images/icon.png`).
5. **🧹 최적화된 리팩토링 코드베이스**
   - 템플릿의 불필요한 보일러플레이트 파일들을 삭제하고 `AuthScreen`, `Weather`, `IndexScreen` 위주의 깔끔한 컴포넌트 구조 완성.

---

## 🛍️ 구글 플레이 스토어(Google Play Store) 정식 배포 가이드

### 1. 구글 개발자 계정 가입 (`Yourself`)
- **계정 타입**: `Yourself` (개인 개발자) 선택
- **등록비**: 평생 $25 USD (1회 결제)
- **전화번호 양식**: E.164 국제 표준 규격 (`+14041234567` 또는 `+821012345678`)

### 2. 프로덕션 빌드 (.aab 파일 생성)
스토어 제출을 위해 구글 전용 포맷인 `.aab` (Android App Bundle) 파일 생성:
```bash
eas build -p android --profile production
```
- 생성 파일: `https://expo.dev/artifacts/eas/...aab` (~26.3 MB, Target SDK 36)

### 3. 구글 플레이 콘솔 앱 세팅 & 파일 업로드
- **Package Name**: `com.abraham.weathertodo`
- **내부 테스트(Internal Testing) 트랙 활용**:
  1. Play Console ➡️ `Test and release` ➡️ `Internal testing` ➡️ `Create new release`
  2. 다운로드한 `.aab` 파일 드래그 앤 드롭 업로드 후 `Save and publish`

### 4. 테스터 초대 및 다운로드 (`Item not found` 트러블슈팅)
- **테스터 이메일 추가**: `Testers` 탭 ➡️ 이메일 입력 후 **반드시 `Enter` 키를 눌러 태그 추가** ➡️ 저장
- **테스터 다운로드 초대 수락 순서**:
  1. `Copy link` 주소를 스마트폰 브라우저(크롬 등)로 엽니다.
  2. 화면에서 **"Become a tester" (테스터 참여/초대 수락)** 버튼을 먼저 클릭합니다.
  3. 승인 후 나타나는 **"Download it on Google Play"** 버튼을 눌러 스토어로 이동하여 설치합니다.
  *(※ 스마트폰 Play Store의 구글 계정과 등록된 테스터 이메일이 일치해야 합니다.)*

---

## 🚀 사용된 핵심 기술 및 개념 정리

### 1. 프론트엔드와 클라우드 공장: Expo & EAS
- **Expo**: React Native 기반 멀티플랫폼 모바일 앱 개발 프레임워크.
- **EAS (Expo Application Services)**: 작성한 코드를 스마트폰 설치 파일(`.apk`, `.ipa`, `.aab`)로 빌드해 주는 클라우드 자동화 공장.
- **Expo Extra Config**: `app.json`의 `extra.firebase` 필드를 통해 공개용 클라이언트 접속 세팅을 관리. `.easignore`나 복잡한 `.env` 주입 과정 없이 로컬/EAS 빌드 100% 호환.

### 2. 백엔드와 인증: Firebase (Firestore & Auth)
- **Firestore**: NoSQL 클라우드 데이터베이스.
- **Authentication**: 이메일/비밀번호 기반 사용자 인증 및 유저 식별자(`UID`) 발급.
- **보안 규칙 (Rules)**: 데이터베이스 접근 권한 제어 (`allow read, write: if true;` 또는 유저 권한 제어).

### 3. 위치 기반 날씨: Open-Meteo & Expo Location
- **Expo Location**: GPS 센서 권한 요청 및 역지오코딩(위도/경도 ➡️ 도시 이름).
- **Open-Meteo API**: API 키 없이 사용할 수 있는 무료 날씨 API.

---

## 🛠️ 프로젝트 구조

```text
weather-todo/
├── assets/images/       # 커스텀 3D 앱 아이콘
├── firebaseConfig.js    # Firebase DB & Auth 설정 (expo-constants 기반)
├── src/
│   ├── app/
│   │   ├── _layout.tsx  # 메인 레이아웃 (Stack)
│   │   └── index.tsx    # 메인 앱 화면 (메모장 & 유저 분기)
│   └── components/
│       ├── AuthScreen.tsx # 로그인 / 회원가입 컴포넌트
│       └── Weather.tsx    # 날씨 및 섭씨/화씨 토글 컴포넌트
├── app.json             # 앱 명세, 패키지 및 Firebase Extra 설정
└── README.md            # 기술 명세 문서
```

---

## ⚙️ 실행 및 빌드 방법

### 1. 사전 설정 (Firebase Console)
- **Firestore Database**: 데이터베이스 생성 후 규칙 설정 (`allow read, write: if true;` 또는 유저 권한 설정).
- **Authentication**: Firebase 콘솔 ➡️ Authentication ➡️ Sign-in method ➡️ **Email/Password** 활성화 (Enable).

### 2. 로컬 실행
```bash
npm install
npm run web # 또는 npx expo start
```

### 3. 안드로이드 (.apk) 및 프로덕션 (.aab) 빌드
```bash
npm install -g eas-cli
eas login

# 폰 직접 설치용 (.apk)
eas build -p android --profile preview

# 구글 플레이 스토어 제출용 (.aab)
eas build -p android --profile production
```
