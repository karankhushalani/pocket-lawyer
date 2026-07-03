# Pocket Lawyer

AI-powered legal document analysis and research app — your chambers in your pocket.

Built with React Native (Expo) and backed by the [Pocket Lawyer API](https://github.com/your-org/pocket-lawyer-api).

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React Native 0.74 via Expo SDK 51 |
| Routing | expo-router 3.5 (file-based) |
| Styling | NativeWind 2.0 (Tailwind CSS) |
| State | Zustand 4.5 |
| Server State | @tanstack/react-query 5 |
| Auth | Firebase Authentication |
| HTTP | Axios 1.6 |
| Icons | lucide-react-native |
| Haptics | expo-haptics |
| Toasts | react-native-toast-message |

## Screens

| Screen | Route | Description |
|--------|-------|-------------|
| **Home** | `/(tabs)` | Document dashboard with stats, FAB for upload |
| **Upload** | `/(tabs)/upload` | Upload PDF/image, AI extracts clauses & flags risks |
| **Laws** | `/(tabs)/laws` | Full-text search of 40+ Indian bare acts with semantic search |
| **Document Chat** | `/document/[id]` | Chat with AI about a specific uploaded document |
| **Laws Detail** | `/laws/[act_short]` | Browse sections of an act with expandable cards |
| **Login** | `/(auth)/login` | Google Sign-In or email/password |
| **Register** | `/(auth)/register` | Create account with Firebase |

## Setup

### Prerequisites

- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- Android emulator, iOS simulator, or Expo Go device
- Pocket Lawyer API running on `localhost:8000`

### 1. Install dependencies

```bash
cd pocket-lawyer
npm install
```

### 2. Firebase setup

Create a Firebase project, enable Email/Password + Google Sign-In auth providers. Place `google-services.json` (Android) and `GoogleService-Info.plist` (iOS) at the project root.

### 3. Configure API URL

Set `EXPO_PUBLIC_API_URL` in your environment or update the default in `services/api.ts`. The app defaults to `http://localhost:8000/api/v1`.

### 4. Run

```bash
npx expo start
```

Scan the QR with Expo Go, or press `a` / `i` for emulator.

## Building with EAS

```bash
# Preview APK for testing
eas build --platform android --profile preview

# Production AAB for Play Store
eas build --platform android --profile production

# Submit to Play Store (internal track)
eas submit --platform android
```

Three profiles in `eas.json`: `development` (debug APK), `preview` (release APK), `production` (release AAB). Set `EAS_PROJECT_ID` in `app.json` after `eas init`.

## Project Structure

```
pocket-lawyer/
├── app/
│   ├── _layout.tsx          # Root: QueryClientProvider, ErrorBoundary, Toast, auth guard
│   ├── (auth)/
│   │   ├── login.tsx
│   │   └── register.tsx
│   ├── (tabs)/
│   │   ├── _layout.tsx      # Bottom tab navigator
│   │   ├── index.tsx        # Home / document list
│   │   ├── upload.tsx       # Document ingestion
│   │   ├── laws.tsx         # Legislation browser
│   │   └── profile.tsx      # User profile
│   ├── document/
│   │   └── [id].tsx         # Document Q&A chat
│   └── laws/
│       └── [act_short].tsx  # Act section browser
├── components/
│   ├── ChatBubble.tsx       # Markdown-rendering chat bubble with source chips
│   ├── DisclaimerBanner.tsx # First-launch AI-generated counsel warning
│   ├── DocumentCard.tsx     # Document list card with type/risk badges
│   ├── EmptyState.tsx       # Reusable empty state with lucide icons
│   ├── ErrorBoundary.tsx    # Global error boundary
│   ├── LawCard.tsx          # (legacy)
│   └── LoadingSpinner.tsx
├── hooks/
│   └── useQueries.ts        # React-query hooks for all API endpoints
├── lib/
│   ├── haptics.ts           # expo-haptics wrappers
│   ├── toast.ts             # Toast show helpers
│   └── toastConfig.tsx      # Dark-themed toast renderers
├── services/
│   ├── api.ts               # Axios client with Firebase token + 401 refresh
│   └── auth.ts              # Firebase auth functions
├── store/
│   └── useAuthStore.ts      # Zustand auth store with AsyncStorage persistence
└── types/
    └── index.ts             # Shared TypeScript types
```

## License

Private — internal use.
