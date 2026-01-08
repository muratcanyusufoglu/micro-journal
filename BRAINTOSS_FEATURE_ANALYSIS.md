# Braintoss Özellik Analizi ve OneLine'a Katkı Önerileri

## 📋 Braintoss'un Temel Özellikleri

Braintoss, GTD (Getting Things Done) metodolojisine uygun, hızlı yakalama (quick capture) odaklı bir uygulama. Kullanıcılar düşüncelerini, görevlerini ve fikirlerini hızlıca yakalayıp email inbox'larına veya diğer servislere gönderiyorlar.

---

## 🎯 OneLine'a Eklenebilecek Özellikler

### 🔥 Yüksek Öncelikli Özellikler

#### 1. **Share Extension (iOS/Android)**
**Açıklama:** Diğer uygulamalardan (Safari, WhatsApp, Photos, vb.) içerik paylaşımı ile OneLine'a direkt not ekleme.

**Kullanım Senaryoları:**
- Web sayfası linkini not olarak kaydetme
- WhatsApp mesajını not olarak kaydetme
- Ekran görüntüsünü not olarak kaydetme
- Fotoğrafı başka uygulamadan direkt ekleme

**Teknik Gereksinimler:**
- iOS: Share Extension target
- Android: Share Intent handling
- expo-sharing veya native module

**Değer:** ⭐⭐⭐⭐⭐ (Çok yüksek - kullanıcıların en çok istediği özellik)

---

#### 2. **Hızlı Yakalama Modu (Quick Capture)**
**Açıklama:** Uygulama açılışında veya widget'tan direkt not ekleme ekranına gitme, minimal UI ile hızlı not alma.

**Özellikler:**
- Tek tıkla not ekleme
- Minimal composer (sadece text input + kaydet)
- Hızlı ses kaydı butonu
- Hızlı fotoğraf çekme butonu
- Widget'tan direkt açılabilir

**Kullanım Senaryoları:**
- Yolda yürürken hızlıca not alma
- Telefonu açıp 2 saniyede not kaydetme
- Widget'tan direkt not ekleme

**Değer:** ⭐⭐⭐⭐⭐ (Braintoss'un temel değer önerisi)

---

#### 3. **Email Entegrasyonu (Opsiyonel)**
**Açıklama:** Notları email'e gönderme özelliği. Kullanıcılar notlarını kendi email inbox'larına gönderebilir.

**Özellikler:**
- Tek notu email'e gönderme
- Seçili notları toplu email gönderme
- Email template'leri (günlük özet, haftalık özet)
- Çoklu email hesabı desteği (iş, kişisel)
- Otomatik flag/etiketleme (email'de)

**Kullanım Senaryoları:**
- GTD metodolojisi kullananlar için inbox'a gönderme
- Notları bilgisayarda işleme için email'e gönderme
- Backup olarak email'e gönderme

**Değer:** ⭐⭐⭐⭐ (Yüksek - GTD kullanıcıları için kritik)

**Not:** Privacy-first yaklaşımınızla çelişebilir. Opsiyonel olarak sunulabilir.

---

#### 4. **QR Kod Okuma ve Kaydetme**
**Açıklama:** QR kodları okuma ve not olarak kaydetme.

**Özellikler:**
- Kamera ile QR kod okuma
- QR kod içeriğini not olarak kaydetme
- QR kod linklerini otomatik açma (opsiyonel)

**Kullanım Senaryoları:**
- Restoran menülerini kaydetme
- WiFi şifrelerini kaydetme
- Linkleri hızlıca kaydetme

**Değer:** ⭐⭐⭐⭐ (Yüksek - pratik kullanım)

**Teknik:** expo-barcode-scanner veya expo-camera ile QR okuma

---

### 🟡 Orta Öncelikli Özellikler

#### 5. **Widget Desteği (iOS/Android)**
**Açıklama:** Ana ekrana widget ekleme, hızlı not ekleme, bugünün özeti görüntüleme.

**Özellikler:**
- Küçük widget: Hızlı not ekleme butonu
- Orta widget: Bugünün özeti + hızlı not ekleme
- Büyük widget: Haftalık özet + mood grafiği

**Değer:** ⭐⭐⭐⭐ (Yüksek - kullanılabilirlik artışı)

**Teknik:** expo-widgets (iOS 14+, Android 12+)

---

#### 6. **Apple Watch Desteği (iOS)**
**Açıklama:** Apple Watch'tan ses kaydı ve hızlı not ekleme.

**Özellikler:**
- Watch'tan ses kaydı
- Watch'tan hızlı not ekleme (sesli veya yazılı)
- Watch'ta bugünün özeti görüntüleme

**Değer:** ⭐⭐⭐ (Orta - Apple Watch kullanıcıları için)

**Teknik:** watchOS app target, WatchConnectivity

---

#### 7. **Çoklu Servis Entegrasyonu (Opsiyonel)**
**Açıklama:** Notları Evernote, Trello, Todoist, Dropbox, Things, Microsoft To Do gibi servislere gönderme.

**Desteklenebilecek Servisler:**
- **Evernote:** Email API veya OAuth
- **Trello:** API ile kart oluşturma
- **Todoist:** API ile task oluşturma
- **Dropbox:** Dosya upload
- **Things:** URL scheme veya email
- **Microsoft To Do:** Microsoft Graph API

**Değer:** ⭐⭐⭐ (Orta - belirli kullanıcı segmenti için)

**Not:** Privacy-first yaklaşımınızla çelişebilir. Opsiyonel, kullanıcı tercihine bağlı olarak sunulabilir.

---

#### 8. **İş Kartı ve Makbuz Yakalama**
**Açıklama:** Fotoğraf çekildiğinde otomatik olarak iş kartı veya makbuz olarak işaretleme, OCR ile metin çıkarma.

**Özellikler:**
- İş kartı fotoğrafı çekme
- Makbuz fotoğrafı çekme
- OCR ile metin çıkarma (Google ML Kit veya benzeri)
- Otomatik kategorilendirme

**Değer:** ⭐⭐⭐ (Orta - özel kullanım senaryosu)

**Teknik:** expo-image-manipulator, OCR library (react-native-text-recognition)

---

#### 9. **GTD Odaklı Özellikler**
**Açıklama:** Getting Things Done metodolojisine uygun özellikler.

**Özellikler:**
- "Inbox" kategorisi (işlenmemiş notlar)
- Notları kategorilere taşıma (Someday/Maybe, Projects, vb.)
- Context etiketleri (@home, @work, @errands)
- Review sistemi (haftalık gözden geçirme)

**Değer:** ⭐⭐⭐ (Orta - GTD kullanıcıları için)

---

### 🟢 Düşük Öncelikli / Gelecek Özellikler

#### 10. **Otomatik Etiketleme ve Kategorilendirme**
**Açıklama:** AI/ML ile notları otomatik kategorilendirme ve etiketleme.

**Değer:** ⭐⭐ (Düşük - karmaşık, privacy endişeleri)

---

#### 11. **Snooze/Reminder Sistemi**
**Açıklama:** Notları belirli bir tarihte tekrar gösterme (snooze).

**Değer:** ⭐⭐⭐ (Orta - kullanışlı ama mevcut calendar ile çakışabilir)

---

#### 12. **Çoklu Fotoğraf Desteği**
**Açıklama:** Bir notta birden fazla fotoğraf ekleme (şu anda 4 fotoğraf destekleniyor, bu özellik geliştirilebilir).

**Değer:** ⭐⭐⭐ (Orta - kullanıcı yorumlarında istenmiş)

---

## 📊 Öncelik Matrisi

| Özellik | Kullanıcı Değeri | Teknik Zorluk | Privacy Uyumu | Öncelik |
|---------|------------------|---------------|---------------|---------|
| Share Extension | ⭐⭐⭐⭐⭐ | Orta | ✅ Yüksek | 🔥 Yüksek |
| Quick Capture | ⭐⭐⭐⭐⭐ | Düşük | ✅ Yüksek | 🔥 Yüksek |
| Email Entegrasyonu | ⭐⭐⭐⭐ | Orta | ⚠️ Orta | 🔥 Yüksek |
| QR Kod Okuma | ⭐⭐⭐⭐ | Düşük | ✅ Yüksek | 🔥 Yüksek |
| Widget Desteği | ⭐⭐⭐⭐ | Orta | ✅ Yüksek | 🟡 Orta |
| Apple Watch | ⭐⭐⭐ | Yüksek | ✅ Yüksek | 🟡 Orta |
| Servis Entegrasyonları | ⭐⭐⭐ | Yüksek | ⚠️ Düşük | 🟡 Orta |
| İş Kartı/Makbuz | ⭐⭐⭐ | Yüksek | ✅ Yüksek | 🟡 Orta |
| GTD Özellikleri | ⭐⭐⭐ | Orta | ✅ Yüksek | 🟡 Orta |

---

## 🎯 Önerilen Uygulama Sırası

### Faz 1: Hızlı Kazanımlar (1-2 hafta)
1. **Quick Capture Modu** - Minimal UI ile hızlı not ekleme
2. **QR Kod Okuma** - expo-barcode-scanner entegrasyonu
3. **Çoklu Fotoğraf İyileştirmesi** - Mevcut 4 fotoğraf limitini kaldırma veya artırma

### Faz 2: Entegrasyonlar (2-4 hafta)
4. **Share Extension** - iOS ve Android share intent desteği
5. **Widget Desteği** - iOS ve Android widget'ları
6. **Email Entegrasyonu** - Opsiyonel email gönderme

### Faz 3: Gelişmiş Özellikler (4-8 hafta)
7. **Apple Watch Desteği** - WatchOS app
8. **GTD Özellikleri** - Inbox, kategoriler, context etiketleri
9. **İş Kartı/Makbuz OCR** - ML Kit entegrasyonu

### Faz 4: Servis Entegrasyonları (Opsiyonel)
10. **Evernote, Trello, Todoist** - API entegrasyonları (privacy-first yaklaşımla)

---

## 💡 Privacy-First Yaklaşım Önerileri

OneLine'ın temel değeri **privacy-first** yaklaşım. Bu özellikler eklenirken:

1. **Email Entegrasyonu:** Opsiyonel, kullanıcı tercihine bağlı
2. **Servis Entegrasyonları:** Opsiyonel, kullanıcı tercihine bağlı, açık açıklama
3. **OCR/ML:** Lokal işleme (Google ML Kit offline mode)
4. **Share Extension:** Sadece lokal kayıt, otomatik sync yok
5. **Widget:** Sadece lokal veri gösterimi

---

## 🔍 Kullanıcı Yorumlarından Çıkarımlar

Braintoss kullanıcı yorumlarından:

✅ **Pozitif:**
- "Hızlı ve basit kullanım"
- "GTD metodolojisi ile mükemmel uyum"
- "Email'e otomatik gönderme çok pratik"
- "Share extension çok kullanışlı"

❌ **Negatif:**
- "iPad desteği yok" (OneLine'da var ✅)
- "Çoklu görsel gönderme yok" (OneLine'da kısmen var)
- "Bağlantı sorunları" (OneLine offline-first, sorun yok ✅)

---

## 📝 Sonuç

Braintoss'tan en değerli özellikler:
1. **Share Extension** - En çok istenen özellik
2. **Quick Capture** - Temel değer önerisi
3. **Email Entegrasyonu** - GTD kullanıcıları için kritik
4. **QR Kod Okuma** - Pratik kullanım

Bu özellikler OneLine'ın privacy-first yaklaşımıyla uyumlu şekilde eklenebilir ve uygulamayı daha kullanışlı hale getirebilir.
