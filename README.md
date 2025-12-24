# OneLine - Daily Journal App

A calm, premium journal app built with Expo and React Native. Capture life's moments with text, voice, and photos.

## Features

- 📝 **Text Notes** - Write your thoughts with a beautiful editor
- 🎤 **Voice Notes** - Record audio memos up to 1 minute
- 📷 **Photo Notes** - Attach images to your entries
- 📅 **Calendar View** - Navigate through your journal by month
- ⏱️ **Revision History** - Track changes to text notes
- 🔒 **Offline First** - All data stored locally with SQLite
- 🎨 **Premium Design** - Calm, modern UI with consistent design tokens

## Tech Stack

- **Expo SDK 54** - React Native framework
- **TypeScript** - Type-safe code
- **expo-router** - File-based navigation
- **expo-sqlite** - Local database for entries
- **expo-av** - Audio recording and playback
- **expo-image-picker** - Photo selection
- **React Native Reanimated** - Smooth animations

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Expo CLI installed globally: `npm install -g expo-cli`
- iOS Simulator (Mac) or Android Studio (for emulators)
- Expo Go app on your phone (optional)

### Installation

1. **Install dependencies**

```bash
npm install
```

2. **Start the development server**

```bash
npx expo start
```

3. **Run on your device**

- **iOS Simulator**: Press `i` in the terminal
- **Android Emulator**: Press `a` in the terminal
- **Physical Device**: Scan the QR code with Expo Go app

## Project Structure

```
DailyNote/
├── app/                          # Expo Router screens
│   ├── (tabs)/                   # Tab navigation
│   │   ├── index.tsx             # Today/Home screen
│   │   ├── calendar.tsx          # Calendar screen
│   │   └── settings.tsx          # Settings screen
│   ├── day/[dateKey].tsx         # Day detail screen
│   ├── revision/[entryId].tsx    # Revision history screen
│   └── _layout.tsx               # Root layout with theme
├── src/
│   ├── theme/                    # Design system
│   │   ├── schema.ts             # Design tokens (colors, spacing, etc)
│   │   └── ThemeProvider.tsx    # Theme context
│   ├── ui/                       # Reusable components
│   │   ├── Screen.tsx
│   │   ├── AppHeader.tsx
│   │   ├── Card.tsx
│   │   ├── TextNoteCard.tsx
│   │   ├── VoiceNoteCard.tsx
│   │   ├── PhotoNoteCard.tsx
│   │   ├── CalendarMonth.tsx
│   │   └── ...
│   ├── data/                     # Database layer
│   │   ├── db.ts                 # SQLite setup & migrations
│   │   ├── repository.ts         # CRUD operations
│   │   └── types.ts              # TypeScript types
│   └── hooks/                    # Custom hooks
│       ├── useVoiceRecorder.ts
│       ├── useVoicePlayer.ts
│       └── usePhotoPicker.ts
└── assets/                       # Images, fonts, etc.
```

## Design System

All UI components use a centralized design system (`src/theme/schema.ts`):

- **Colors**: Calm, neutral palette
- **Spacing**: 8pt grid system
- **Typography**: Clear hierarchy with serif titles
- **Border Radius**: Consistent rounded corners
- **Shadows**: Soft, subtle depth

No component contains hardcoded design values - everything references the theme tokens.

## Database Schema

### `entries` table
- Stores all journal entries (text, voice, photo)
- Indexed by dateKey for fast lookups
- Soft delete support

### `text_revisions` table
- Stores previous versions of text notes
- Created automatically when text is edited
- Linked to parent entry via foreign key

## Key Features Implementation

### Text Notes with Revisions
- When a text note is edited, the previous version is saved to `text_revisions`
- View full history in the Revision History screen
- Timeline UI shows current version and all past versions

### Voice Recording
- Records up to 60 seconds
- Saves as M4A files in app documents directory
- Playback with play/pause controls
- Visual waveform display

### Photo Attachments
- Select from photo library
- Supports up to 4 photos per composer session
- Stores local URIs

### Calendar
- Month navigation with prev/next buttons
- Visual indicators for days with content
- Inline day summary panel shows preview and entry count
- Tap day to view all entries for that date

## Scripts

- `npm start` - Start Expo development server
- `npm run android` - Run on Android
- `npm run ios` - Run on iOS
- `npm run web` - Run in web browser
- `npm run lint` - Run ESLint

## Future Enhancements

- App Lock with biometric authentication
- Dark mode support
- Export to PDF/Markdown (Pro feature)
- Cloud sync (optional)
- Search functionality
- Tags and filtering

## License

This project is private and proprietary.

## Support

For issues or questions, please contact the development team.
# micro-journal
