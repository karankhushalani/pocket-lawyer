# Pocket Lawyer

AI-powered legal research and document analysis app — your chambers in your pocket.

Built with React Native (Expo) and backed by the [Pocket Lawyer API](https://github.com/your-org/pocket-lawyer-api).

## Screens

| Screen | Description |
|--------|-------------|
| **Chambers** | Document dashboard — active briefcases, recent matters |
| **Ingestion** | Upload legal PDFs (agreements, contracts, notices) |
| **Legislation** | Full-text search of Indian bare acts with AI answers |
| **Counsel Profile** | Account details, credentials, logout |
| **Document Q&A** | Chat with an AI about a specific uploaded document |

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React Native 0.74 via Expo SDK 51 |
| Routing | expo-router 3.5 (file-based) |
| Styling | NativeWind 2.0 (Tailwind CSS) |
| State | Zustand 4.5 |
| Auth | Firebase Authentication |
| HTTP | Axios 1.6 |
| Icons | lucide-react-native |

## Setup

### Prerequisites

- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (macOS) or Android emulator
- Pocket Lawyer API running on `localhost:8000`

### 1. Install dependencies

```bash
cd pocket-lawyer
npm install
```

### 2. Firebase setup

Create a Firebase project and enable Email/Password authentication. Add your `google-services.json` (Android) and `GoogleService-Info.plist` (iOS) to the project root.

### 3. Run

```bash
npx expo start
```

Scan the QR code with Expo Go, or press `a` for Android emulator / `i` for iOS simulator.

The app connects to the API at `localhost:8000` (`10.0.2.2:8000` on Android emulator). Start the API first if you want live data — otherwise the app runs in demo mode with hardcoded mock data.

## Demo Mode

Every API call is wrapped in try/catch. When the backend is unreachable, the app falls back to rich mock data:

- **Chambers**: 3 premium briefs (Tata/Softbank, IP breach, Reliance Jio NDA)
- **Legislation**: IPC Section 302, Contract Act Section 73, IT Act Section 43A
- **Document Q&A**: AI reply citing Section 73 of the Indian Contract Act
- **Auth bypass**: `demo@pocketlawyer.com` / `lawyer123` logs you in as "Senior Advocate Malhotra"

## Project Structure

```
pocket-lawyer/
├── app/
│   ├── _layout.tsx            # Root layout with auth routing
│   ├── (auth)/
│   │   ├── login.tsx
│   │   └── register.tsx
│   ├── (tabs)/
│   │   ├── _layout.tsx        # Bottom tab navigator
│   │   ├── index.tsx          # Chambers / document list
│   │   ├── upload.tsx         # Document ingestion
│   │   ├── laws.tsx           # Legislation search
│   │   └── profile.tsx        # User profile
│   └── document/
│       └── [id].tsx           # Document Q&A chat
├── components/
│   ├── LoadingSpinner.tsx
│   ├── DocumentCard.tsx
│   ├── LawCard.tsx
│   └── ChatBubble.tsx
├── services/
│   ├── api.ts                 # Axios client with Firebase token interceptor
│   └── auth.ts               # Firebase auth subscriber
├── store/
│   └── useAuthStore.ts        # Zustand auth store
└── types/
    └── index.ts               # Shared TypeScript types
```

## License

Private — internal use.
