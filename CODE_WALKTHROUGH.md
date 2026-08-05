# 📘 Weather Todo App - 코드 워크플로우 & 아키텍처 가이드

이 문서에는 **Weather Todo** 앱의 전체 데이터 흐름, 핵심 설정 파일 4총사 설명, 주요 React/Firebase 메소드 개념, 그리고 **다른 사람에게 이 코드를 명쾌하게 설명하는 방법**이 정리되어 있습니다.

---

## 1. ⚙️ 핵심 설정 파일 4총사 완벽 정리

| 파일명 | 비유 | 주요 역할 및 설명 |
| :--- | :--- | :--- |
| **`app.json`** | 🆔 **앱의 주민등록증 겸 컨트롤 센터** | 앱의 정체성을 정의합니다. 바탕화면 이름(`weather-todo`), 전 세계 고유 식별자(`com.abraham.weathertodo`), 앱 아이콘, 버전(`1.0.1`), 그리고 Firebase 접속 정보(`extra.firebase`)를 보관합니다. |
| **`eas.json`** | 🏭 **클라우드 빌드 공장 주문서** | EAS 클라우드 서버에 전달하는 빌드 규칙서입니다. 폰 직접 설치용 `preview`(`APK`) 프로필과 구글 플레이 스토어 제출용 `production`(`AAB`) 프로필 규격을 지정합니다. |
| **`tsconfig.json`** | 📐 **타입스크립트 문법 엄격 규칙서** | 코드의 오타나 타입 에러를 미리 잡아주는 검사관입니다. 경로 별칭(`@/*`) 설정이나 자바스크립트 변환 규칙을 엄격하게 통제합니다. |
| **`firebaseConfig.js`** | 🗝️ **클라우드 통로 세팅기** | `app.json`의 설정값을 `expo-constants`로 안전하게 읽어와 구글 Firestore 데이터베이스 및 Auth 인증 서버로 향하는 전역 접속 통로를 개설합니다. |

---

## 2. 💡 핵심 React & Firebase 메소드 쉽고 직관적인 설명집

* 📦 **`useState` (상태 메모장)**
  > *"앱의 화면을 바꿔주는 **스위치 데이터**를 보관하는 곳이야! 값이 바뀌면 리액트가 0초 만에 알아채고 화면을 자동으로 다시 그려줘."*
* 🤖 **`useEffect` (자동 트리거 시계)**
  > *"앱이 켜지거나 사용자가 바뀔 때 **자동으로 파이어베이스나 날씨 API를 불러오는 자동 장치**야!"*
* 📡 **`onSnapshot` (실시간 감지 CCTV)**
  > *"구글 서버 데이터베이스를 24시간 감시하고 있다가, 새 메모가 추가되거나 지워지면 **새로고침 없이 앱 화면에 즉시 밀어주는 실시간 연결선**이야!"*
* 🔐 **`onAuthStateChanged` (로그인 자격증 감시관)**
  > *"사용자가 로그인했는지, 로그아웃했는지 실시간으로 파악해서 **로그인 화면을 띄울지 메모장 화면을 띄울지 정해주는 수문장**이야!"*
* ✍️ **`addDoc` / `deleteDoc` (구글 창고 도장)**
  > *"구글 데이터베이스 서류함에 **새 메모를 찰떡같이 넣거나(addDoc), 원하지 않는 메모를 안전하게 파기(deleteDoc)**하는 도장이야!"*

---

## 3. 🔄 한눈에 보는 전체 앱 워크플로우

```mermaid
sequenceDiagram
    autonumber
    actor User as 사용자 (App / Web)
    participant App as React Native App (index.tsx)
    participant Auth as Firebase Auth (AuthScreen.tsx)
    participant DB as Firestore Database
    participant WeatherAPI as Open-Meteo API (Weather.tsx)

    User->>App: 앱 실행
    App->>Auth: onAuthStateChanged (로그인 여부 감시)
    alt 로그인되지 않음
        App-->>User: AuthScreen (로그인/회원가입 폼) 표시
        User->>Auth: 이메일/비밀번호 입력 및 로그인 요청
        Auth-->>App: 인증 성공 (User UID 발급)
    end
    
    App->>WeatherAPI: GPS 위도/경도로 날씨 요청
    WeatherAPI-->>App: 현재 온도 및 날씨 상태 반환
    
    App->>DB: query(memos, where('userId', '==', user.uid))
    DB-->>App: onSnapshot (해당 유저의 메모 실시간 동기화)
    App-->>User: 메인 화면 (날씨 위젯 + 내 메모 리스트) 출력
```

---

## 4. 🧩 주요 소스 코드 파일별 역할과 설계 의도

### 1) `src/app/index.tsx` - 메인 관제탑 (State Controller)
* **역할**: 전체 앱의 상태(인증 상태, 메모 데이터, 로딩 상태)를 총괄 관리하는 메인 화면입니다.
* **설계 의도**:
  - `onAuthStateChanged` 리스너로 로그인 상태를 실시간 감지하여 미로그인 시 `<AuthScreen />`, 로그인 시 메모장 화면으로 자동 전환합니다.
  - `where('userId', '==', user.uid)` 조건절을 붙여 내 메모만 구글 서버에서 가져오는 멀티테넌시 보안을 확보했습니다.

### 2) `src/components/AuthScreen.tsx` - 인증 전문 컴포넌트
* **역할**: 이메일/비밀번호 기반 회원가입과 로그인을 처리합니다.
* **설계 의도**:
  - `isSignUp` 상태 하나로 회원가입 폼과 로그인 폼을 동적으로 전환하여 코드 중복을 최소화했습니다.
  - 구글 예외 코드를 한국어/영문 친화적 메시지로 자동 변환합니다.

### 3) `src/components/Weather.tsx` - 위치 기반 날씨 위젯
* **역할**: 스마트폰 GPS로 내 위치를 파악하고 무료 Open-Meteo API로 날씨를 불러옵니다.
* **설계 의도**:
  - 섭씨(℃) ↔ 화씨(℉) 전환 시 매번 서버 요청을 보내지 않고 **프론트엔드 실시간 계산`((C * 1.8) + 32)`**으로 처리하여 0ms 반응속도를 냅니다.

---

## 5. 🎙️ 이 코드를 남에게 멋지게 설명하는 3가지 핵심 포인트 (Presentation Pitch)

1. **"서버리스(BaaS) 아키텍처로 백엔드 구축 없이 웹소켓 수준의 실시간 동기화를 달성했습니다."**
   > *"구글 Firestore의 `onSnapshot` 구독 모델을 사용해서, 메모를 작성하면 새로고침 없이 모든 기기에서 데이터가 실시간으로 뿅 갱신됩니다."*
2. **"유저 UID 기반 멀티테넌시(Multi-tenancy)로 데이터 보안을 완벽히 격리했습니다."**
   > *"메모 생성 시 `userId` 꼬리표가 함께 들어갑니다. 쿼리 시 `where` 조건절로 로그인된 아이디의 메모만 엄격히 조회하므로 타인의 데이터 접근이 철저히 차단됩니다."*
3. **"Cross-Platform 호환과 0ms 반응속도의 UX 연산을 적용했습니다."**
   > *"React Native과 Expo Router 기반으로 안드로이드, iOS, Web까지 100% 동일하게 동작하며, 섭씨/화씨 토글은 프론트엔드 연산으로 처리해 즉각 반응합니다."*
