# OneLine Journal - Implementation Notes

## Project Overview

This is a fully functional daily journal app called "OneLine" built with Expo and React Native, based on the HTML mockups provided. The app follows all the design requirements and implements a complete offline-first journal experience.

## ✅ All Requirements Implemented

### Design System
- ✅ Single source of truth theme schema (`src/theme/schema.ts`)
- ✅ Unified color palette from HTML mockups
- ✅ Consistent border radius tokens (card: 28, button: 26, etc.)
- ✅ 8pt spacing scale
- ✅ No hardcoded design values in components
- ✅ ThemeProvider context for all components

### Navigation Structure
- ✅ expo-router with tabs and stack
- ✅ Three tabs: Today, Calendar, Settings
- ✅ Stack screens: DayDetail, RevisionHistory
- ✅ Clean navigation flow matching mockups

### Database (SQLite)
- ✅ Offline-first with expo-sqlite
- ✅ Two tables: `entries` and `text_revisions`
- ✅ Automatic migrations on app start
- ✅ Soft delete support
- ✅ Indexed queries for performance

### Today/Home Screen
- ✅ Text input with TextAreaCard
- ✅ Voice recorder (compact inline component)
- ✅ Photo picker with grid display
- ✅ "Add to Today" button (disabled when empty)
- ✅ Today's entries list below composer
- ✅ Date header with subtitle

### Calendar Screen
- ✅ Month navigation (prev/next buttons)
- ✅ Visual dots for days with content
- ✅ Day selection with ring indicator
- ✅ Inline DaySummaryPanel
  - Shows item count
  - Preview of first text note
  - Icons for voice/photo presence
  - "View details" CTA to DayDetail
- ✅ Empty state when no content

### DayDetail Screen
- ✅ Chronological feed of all entries for selected date
- ✅ Text, Voice, and Photo note cards
- ✅ Overflow menu on each card
- ✅ Floating Action Button (+)
- ✅ Bottom sheet for add options
- ✅ Back button to return to calendar

### RevisionHistory Screen
- ✅ Text notes only (as specified)
- ✅ Current version highlighted at top
- ✅ Timeline view of all revisions
- ✅ Formatted timestamps
- ✅ Visual distinction between current and past versions

### Settings Screen
- ✅ App Lock (placeholder)
- ✅ Theme selector (placeholder)
- ✅ Export (disabled with "Pro" badge)
- ✅ About dialog
- ✅ Footer with "Offline. No account." message

### Voice Recording
- ✅ expo-av integration
- ✅ Record up to 60 seconds
- ✅ Save to FileSystem
- ✅ Playback controls
- ✅ Visual waveform in cards
- ✅ Duration display

### Photo Handling
- ✅ expo-image-picker integration
- ✅ Select from library
- ✅ Grid display with remove option
- ✅ Photo note cards with thumbnails

### Text Revisions
- ✅ Automatic revision creation on edit
- ✅ Previous text saved to `text_revisions` table
- ✅ "View History" in entry menu
- ✅ Timeline UI in RevisionHistory screen

## Component Architecture

### Theme System
```
src/theme/
  ├── schema.ts          # Design tokens
  └── ThemeProvider.tsx  # React context
```

### UI Components
All components are typed, reusable, and follow the design system:
- Screen (SafeArea wrapper)
- AppHeader (with subtitle support)
- Cards (Text, Voice, Photo)
- Buttons (Primary, Secondary, Icon)
- Calendar components
- Input components
- Bottom sheet modal

### Data Layer
```
src/data/
  ├── db.ts           # SQLite setup & helpers
  ├── repository.ts   # CRUD operations
  └── types.ts        # TypeScript interfaces
```

### Custom Hooks
```
src/hooks/
  ├── useVoiceRecorder.ts  # Audio recording logic
  ├── useVoicePlayer.ts    # Audio playback logic
  └── usePhotoPicker.ts    # Photo selection logic
```

## Key Technical Decisions

1. **SQLite over AsyncStorage**: Better for relational data and querying
2. **Component-based design system**: Easy to maintain and update
3. **Soft deletes**: Data preservation for potential recovery
4. **File-based audio storage**: Efficient for media files
5. **Revision history as separate table**: Clean schema, easy querying
6. **expo-router**: Modern navigation with type safety

## Design Token Implementation

Every component uses theme tokens:
```typescript
const $card: ViewStyle = {
  backgroundColor: theme.colors.bgSurface,  // Not "#FFFFFF"
  borderRadius: theme.radius.card,           // Not 28
  padding: theme.spacing.lg,                 // Not 24
}
```

## Future Enhancements (Not Implemented)

These are placeholders in Settings:
- App Lock with biometric auth
- Dark mode toggle
- Export to PDF/Markdown
- Cloud sync
- Search functionality
- Tags and categories

## Setup Instructions

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the dev server:
   ```bash
   npx expo start
   ```

3. Run on device:
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app

## File Structure

```
DailyNote/
├── app/
│   ├── (tabs)/
│   │   ├── index.tsx      # Today screen
│   │   ├── calendar.tsx   # Calendar screen
│   │   └── settings.tsx   # Settings screen
│   ├── day/[dateKey].tsx  # Day detail
│   ├── revision/[entryId].tsx  # Revision history
│   └── _layout.tsx        # Root layout
├── src/
│   ├── theme/             # Design system
│   ├── ui/                # Component library
│   ├── data/              # Database layer
│   └── hooks/             # Custom hooks
└── assets/                # Images, fonts
```

## Database Schema

### entries
```sql
id INTEGER PRIMARY KEY
dateKey TEXT (YYYY-MM-DD)
type TEXT (text|voice|photo)
createdAt TEXT (ISO timestamp)
updatedAt TEXT (ISO timestamp)
deletedAt TEXT (nullable)
textContent TEXT (nullable)
audioUri TEXT (nullable)
photoUri TEXT (nullable)
photoTitle TEXT (nullable)
durationMs INTEGER (nullable)
isEdited INTEGER (0|1)
```

### text_revisions
```sql
id INTEGER PRIMARY KEY
entryId INTEGER (FK to entries)
textContent TEXT
createdAt TEXT (ISO timestamp)
```

## Testing Recommendations

1. Test voice recording permissions
2. Test photo picker permissions
3. Test calendar month navigation
4. Test revision history creation
5. Test soft delete and restore
6. Test offline data persistence

## Performance Considerations

- SQLite queries are indexed
- Images use React Native Image component
- Audio playback uses native modules
- Minimal re-renders with proper React hooks
- Lazy loading of entry lists

## Accessibility

- All buttons have proper touch targets (44x44 minimum)
- Color contrast meets WCAG standards
- Semantic structure with proper headings
- SafeArea support for notched devices

---

**Status**: ✅ Fully implemented and ready for testing

**Build Date**: December 24, 2025

**Version**: 1.0.0











