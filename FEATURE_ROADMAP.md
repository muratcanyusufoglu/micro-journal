# Feature Roadmap: Share Extension, Quick Capture, Email Integration

## 📋 Genel Bakış

Bu dokümantasyon, OneLine uygulamasına eklenecek üç özellik için detaylı roadmap ve task breakdown içerir:
1. **Share Extension** (iOS/Android)
2. **Quick Capture Mode**
3. **Email Integration**

---

## 🎯 Özellik 1: Share Extension

### Amaç
Diğer uygulamalardan (Safari, WhatsApp, Photos, vb.) içerik paylaşımı ile OneLine'a direkt not ekleme.

### Teknik Gereksinimler
- iOS: Share Extension target (native module gerekebilir)
- Android: Share Intent handling (expo-sharing veya native module)
- Deep linking: `oneline://capture?text=...&image=...&url=...`

### Task Breakdown

#### Phase 1: Deep Linking Infrastructure
- [ ] **Task 1.1:** Deep linking URL scheme yapılandırması
  - `app.json`'da `scheme: "oneline"` zaten var ✅
  - `expo-linking` ile URL parsing hook'u oluştur
  - `app/_layout.tsx`'te deep link handler ekle
  - Test: `oneline://capture?text=test` URL'i ile uygulama açılmalı

- [ ] **Task 1.2:** Capture route oluşturma
  - `app/capture.tsx` screen oluştur
  - URL parametrelerini parse et (text, image, url)
  - Parametrelere göre otomatik not oluştur
  - Kaydetme sonrası Today ekranına yönlendir

- [ ] **Task 1.3:** Share data type'ları tanımlama
  - `src/data/types.ts`'e `ShareData` interface ekle
  - Text, image, URL, file tiplerini destekle

#### Phase 2: iOS Share Extension
- [ ] **Task 2.1:** iOS Share Extension target oluşturma
  - `ios/OneLineShareExtension/` klasörü oluştur
  - `ShareViewController.swift` oluştur
  - `Info.plist` yapılandırması
  - `NSExtensionActivationRule` ayarları

- [ ] **Task 2.2:** Share Extension UI
  - Minimal UI (sadece kaydet butonu)
  - Paylaşılan içeriği preview et
  - Text, image, URL desteği

- [ ] **Task 2.3:** Share Extension → Main App iletişimi
  - App Groups kullanarak data paylaşımı
  - `UserDefaults(suiteName: "group.com.oneline.dailynotes")`
  - Main app'te App Group'dan data oku
  - Deep link ile capture route'a yönlendir

- [ ] **Task 2.4:** iOS build configuration
  - `app.json`'da iOS share extension plugin yapılandırması
  - Xcode project'e extension target ekle
  - Build ve test

#### Phase 3: Android Share Intent
- [ ] **Task 3.1:** Android Intent Filter yapılandırması
  - `app.json`'da Android intent filter ekle
  - `android.intent.action.SEND` ve `android.intent.action.SEND_MULTIPLE` desteği
  - MIME type'lar: `text/plain`, `image/*`, `*/*`

- [ ] **Task 3.2:** Android Share Intent handler
  - `app/_layout.tsx`'te Android intent handling
  - `expo-linking` ile intent data parse et
  - Share data'yı capture route'a gönder

- [ ] **Task 3.3:** Android test ve doğrulama
  - Farklı uygulamalardan paylaşım test et
  - Text, image, URL, multiple items test et

#### Phase 4: Share Data Processing
- [ ] **Task 4.1:** Text share handling
  - Paylaşılan text'i direkt not olarak kaydet
  - URL varsa link olarak ekle

- [ ] **Task 4.2:** Image share handling
  - Paylaşılan image'i `FileSystem`'e kopyala
  - Image URI'sini `addPhotoEntry` ile kaydet
  - Multiple images desteği

- [ ] **Task 4.3:** URL share handling
  - Paylaşılan URL'i text not olarak kaydet
  - URL preview/metadata çekme (opsiyonel)

- [ ] **Task 4.4:** File share handling (Android)
  - Generic file paylaşımı desteği
  - File type detection
  - Desteklenmeyen file type'lar için error handling

#### Phase 5: UI/UX İyileştirmeleri
- [ ] **Task 5.1:** Capture screen UI
  - Paylaşılan içeriği preview göster
  - Edit butonu (kullanıcı düzenleyebilir)
  - Mood picker (opsiyonel)
  - Save butonu

- [ ] **Task 5.2:** Toast notifications
  - Başarılı paylaşım sonrası toast
  - Hata durumlarında error toast

- [ ] **Task 5.3:** Settings'te share extension bilgisi
  - Share extension nasıl kullanılır açıklaması
  - Desteklenen uygulamalar listesi

### Test Senaryoları
- [ ] Safari'den link paylaşımı
- [ ] Photos'tan image paylaşımı
- [ ] WhatsApp'tan text/image paylaşımı
- [ ] Notes'tan text paylaşımı
- [ ] Multiple images paylaşımı (Android)
- [ ] Error handling (desteklenmeyen format)

---

## 🎯 Özellik 2: Quick Capture Mode

### Amaç
Minimal UI ile hızlı not ekleme. Widget'tan veya deep link ile direkt açılabilir.

### Teknik Gereksinimler
- Minimal composer screen
- Deep linking: `oneline://quick-capture`
- Widget desteği (gelecekte)

### Task Breakdown

#### Phase 1: Quick Capture Screen
- [ ] **Task 1.1:** Quick capture route oluşturma
  - `app/quick-capture.tsx` screen oluştur
  - Minimal UI: sadece text input + save butonu
  - Header'ı kaldır veya minimal yap
  - Full-screen keyboard focus

- [ ] **Task 1.2:** Quick capture UI component
  - `src/ui/QuickCaptureScreen.tsx` component
  - Text input (büyük, odaklanmış)
  - Save butonu (keyboard üstünde veya altında)
  - Auto-focus text input

- [ ] **Task 1.3:** Quick save functionality
  - Text varsa direkt `addTextEntry` çağır
  - Kaydetme sonrası toast göster
  - 1 saniye sonra uygulamayı kapat veya Today'e dön
  - Haptic feedback

#### Phase 2: Deep Linking Integration
- [ ] **Task 2.1:** Quick capture deep link
  - `oneline://quick-capture` URL scheme
  - `app/_layout.tsx`'te route handling
  - Quick capture screen'e yönlendir

- [ ] **Task 2.2:** Pre-filled text desteği
  - `oneline://quick-capture?text=...` parametresi
  - Text input'a pre-fill et
  - Kullanıcı düzenleyebilir

#### Phase 3: Navigation Integration
- [ ] **Task 3.1:** Today screen'den quick capture
  - Settings'te "Quick Capture" butonu
  - Veya Today screen'de swipe gesture
  - Deep link ile quick capture aç

- [ ] **Task 3.2:** Shortcut support (iOS)
  - iOS Shortcuts app entegrasyonu
  - "Add Quick Note" shortcut
  - Text parametresi ile çağrılabilir

- [ ] **Task 3.3:** Android shortcuts
  - Android app shortcuts
  - Home screen'den direkt quick capture

#### Phase 4: UX İyileştirmeleri
- [ ] **Task 4.1:** Keyboard optimizations
  - Auto-focus text input
  - Return key ile kaydetme
  - Keyboard dismiss handling

- [ ] **Task 4.2:** Animation ve transitions
  - Smooth screen transition
  - Save animation
  - Success feedback

- [ ] **Task 4.3:** Error handling
  - Boş text kontrolü
  - Database error handling
  - User-friendly error messages

### Test Senaryoları
- [ ] Deep link ile quick capture açma
- [ ] Text input ve kaydetme
- [ ] Pre-filled text ile açma
- [ ] Keyboard interactions
- [ ] Error handling

---

## 🎯 Özellik 3: Email Integration

### Amaç
Notları email'e gönderme. GTD kullanıcıları için inbox'a gönderme. Opsiyonel özellik.

### Teknik Gereksinimler
- `expo-mail-composer` veya native email API
- Email template'leri
- Settings'te email configuration

### Task Breakdown

#### Phase 1: Email Composer Integration
- [ ] **Task 1.1:** Email composer library kurulumu
  - `expo-mail-composer` paketi kur
  - iOS ve Android için native module kontrolü
  - Email client availability check

- [ ] **Task 1.2:** Email composer hook
  - `src/hooks/useEmailComposer.ts` hook oluştur
  - `MailComposer.composeAsync` wrapper
  - Error handling

- [ ] **Task 1.3:** Email composer UI component
  - `src/ui/EmailComposerSheet.tsx` component
  - Recipient input
  - Subject input
  - Body textarea
  - Send butonu

#### Phase 2: Entry to Email Conversion
- [ ] **Task 2.1:** Text entry email formatı
  - Text entry'yi email body'ye dönüştür
  - Date, time, mood bilgisi ekle
  - Markdown veya plain text formatı

- [ ] **Task 2.2:** Photo entry email formatı
  - Photo entry'yi email'e ekle
  - Image attachment
  - Text varsa body'ye ekle

- [ ] **Task 2.3:** Voice entry email formatı
  - Voice entry için email body
  - Audio file attachment (opsiyonel)
  - Duration bilgisi

- [ ] **Task 2.4:** Multiple entries email
  - Birden fazla entry'yi tek email'de gönder
  - Entry listesi formatı
  - Date grouping

#### Phase 3: Email Templates
- [ ] **Task 3.1:** Template system
  - `src/data/emailTemplates.ts` dosyası
  - Template interface tanımla
  - Default template'ler

- [ ] **Task 3.2:** Daily summary template
  - Günlük özet email template
  - Tüm günün entry'leri
  - Mood summary
  - Entry count

- [ ] **Task 3.3:** Weekly summary template
  - Haftalık özet email template
  - Haftanın tüm entry'leri
  - Mood distribution
  - Statistics

- [ ] **Task 3.4:** Single entry template
  - Tek entry email template
  - Entry detayları
  - Timestamp, mood, content

#### Phase 4: Settings Integration
- [ ] **Task 4.1:** Email settings screen
  - `app/email-settings.tsx` screen
  - Default recipient email
  - Email template seçimi
  - Auto-flag/auto-label ayarları (opsiyonel)

- [ ] **Task 4.2:** Email preferences storage
  - `AsyncStorage` ile email preferences kaydet
  - Default recipient
  - Template preferences
  - Auto-send ayarları (opsiyonel)

- [ ] **Task 4.3:** Settings screen'den email settings
  - Settings'te "Email Integration" section
  - Email settings'e navigate butonu
  - Email enabled/disabled toggle

#### Phase 5: Entry Actions Integration
- [ ] **Task 5.1:** Entry menu'ye email butonu
  - `ActionSheet`'te "Send via Email" action
  - Text, photo, voice entry'ler için
  - Email composer aç

- [ ] **Task 5.2:** Bulk email action
  - Day detail screen'de multiple selection
  - "Send Selected via Email" butonu
  - Multiple entries email composer

- [ ] **Task 5.3:** Quick email action
  - Today screen'de quick email butonu
  - Bugünün tüm entry'lerini email'e gönder
  - Daily summary template kullan

#### Phase 6: Advanced Features (Opsiyonel)
- [ ] **Task 6.1:** Auto-flag support
  - Email subject'e flag ekle
  - Gmail/Outlook flag formatı
  - Settings'te toggle

- [ ] **Task 6.2:** Multiple email accounts
  - Birden fazla recipient kaydet
  - Email account seçimi
  - Context-based email (work/personal)

- [ ] **Task 6.3:** Email scheduling
  - Belirli saatte otomatik email
  - Daily/weekly summary scheduling
  - Background task (opsiyonel, karmaşık)

### Test Senaryoları
- [ ] Text entry email gönderme
- [ ] Photo entry email gönderme
- [ ] Voice entry email gönderme
- [ ] Multiple entries email
- [ ] Email template'leri
- [ ] Settings'te email configuration
- [ ] Error handling (email client yoksa)

---

## 📅 Öncelik Sırası ve Tahmini Süre

### Faz 1: Quick Capture (1-2 hafta)
- En hızlı implement edilebilir
- Yüksek kullanıcı değeri
- Minimal teknik risk

### Faz 2: Share Extension (2-3 hafta)
- Orta zorluk
- Yüksek kullanıcı değeri
- Native module gerekebilir

### Faz 3: Email Integration (2-3 hafta)
- Orta zorluk
- Orta kullanıcı değeri (belirli segment için)
- Opsiyonel özellik

---

## 🔧 Teknik Notlar

### Deep Linking
- Mevcut: `scheme: "oneline"` ✅
- Eklenecek: `expo-linking` ile URL parsing
- Routes: `/capture`, `/quick-capture`

### Native Modules
- Share Extension: iOS native Swift code gerekebilir
- Email: `expo-mail-composer` kullanılabilir
- Android: Intent handling ile yapılabilir

### Privacy Considerations
- Email integration opsiyonel olmalı
- Kullanıcı açıkça enable etmeli
- Email data'sı lokal saklanmamalı (sadece preferences)

---

## ✅ Definition of Done

Her özellik için:
- [ ] Kod implementasyonu tamamlandı
- [ ] iOS'ta test edildi
- [ ] Android'de test edildi
- [ ] Error handling eklendi
- [ ] UI/UX iyileştirmeleri yapıldı
- [ ] Documentation güncellendi
- [ ] Privacy considerations gözden geçirildi
