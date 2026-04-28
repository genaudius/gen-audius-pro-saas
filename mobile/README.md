# Gen Audius Pro — Mobile (Flutter)

iOS & Android app. Shares the same backend API as the web dashboard.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Flutter 3.22+ / Dart 3.4+ |
| State | Riverpod 2 (NotifierProvider, FutureProvider) |
| Navigation | GoRouter 14 with auth guards |
| Network | Dio + auth interceptor + auto token refresh |
| Storage | flutter_secure_storage (Keychain / EncryptedSharedPrefs) |
| Audio | just_audio + audio_waveforms |
| Animations | flutter_animate |
| Push | Firebase Messaging |

## Setup

### Prerequisites
- Flutter 3.22+ (`flutter --version`)
- Xcode 16+ (iOS)
- Android Studio / SDK 34+ (Android)

### Install

```bash
cd apps/mobile
flutter pub get
```

### Configure environment

```bash
# Development (local backend)
flutter run --dart-define=ENV=development

# Staging
flutter run --dart-define=ENV=staging

# Production
flutter run --dart-define=ENV=production
```

### Firebase setup

```bash
# Install FlutterFire CLI
dart pub global activate flutterfire_cli

# Configure Firebase project
flutterfire configure --project=gen-audius-pro
```

### Run

```bash
# iOS Simulator
flutter run -d "iPhone 16 Pro"

# Android Emulator  
flutter run -d emulator-5554

# Physical device
flutter run -d <device-id>
```

## Build for stores

```bash
# iOS (requires Apple Developer account)
flutter build ipa --release --dart-define=ENV=production

# Android
flutter build appbundle --release --dart-define=ENV=production
```

## Architecture

```
lib/
├── main.dart                   # Entry point
├── core/
│   ├── theme/app_theme.dart   # Dark Luxury design system
│   ├── network/dio_client.dart # API client + interceptors
│   ├── storage/secure_storage.dart
│   └── router/app_router.dart # GoRouter + auth guards
├── features/
│   ├── auth/                  # Login, Register, Verify
│   ├── dashboard/             # Home screen
│   ├── studio/                # Music + Image generation
│   ├── chatgau/               # AI chat
│   ├── wallet/                # Credits
│   └── profile/               # User profile
└── shared/
    └── widgets/               # GAButton, GACard, GATextField...
```

## Sprint Status

| Feature | Status |
|---|---|
| Dark Luxury theme | ✅ Complete |
| Navigation (GoRouter) | ✅ Complete |
| Auth (login/register/verify) | ✅ Structure ready |
| Studio — Music generation | ✅ UI ready, mock engine |
| Dashboard | ✅ Complete |
| ChatGAU | 🚧 Sprint 3 |
| Wallet | ✅ UI ready |
| Profile | ✅ UI ready |
| Push notifications | ⬜ Sprint 4 |
| Biometric login | ⬜ Sprint 4 |
