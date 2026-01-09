# iOS Share Extension Setup Guide

Bu dokümantasyon, OneLine uygulamasına iOS Share Extension eklemek için gereken adımları detaylı olarak açıklar.

## 📋 Genel Bakış

iOS Share Extension, kullanıcıların Safari, Photos, WhatsApp gibi uygulamalardan içerik paylaşırken OneLine'ı seçebilmesini sağlar. Paylaşılan içerik (text, image, URL) otomatik olarak OneLine'a not olarak eklenir.

## ⚠️ ÖNEMLİ: Expo Managed Workflow

Bu bir Expo uygulaması olduğu için, native dosyalarda yapılan manuel değişiklikler `expo prebuild` sonrası kaybolacaktır. Bu nedenle Share Extension, **Expo Config Plugin** kullanılarak `app.json` üzerinden yapılandırılmıştır.

### Otomatik Yapılandırma

Share Extension zaten `app.json`'da yapılandırılmış durumda:
- ✅ Config plugin: `./plugins/withShareExtension.js`
- ✅ App Groups: `group.com.oneline.dailynotes`
- ✅ Share Extension target otomatik oluşturulacak

### Yapılması Gerekenler

1. **Apple Developer Portal'da App Group Oluşturma** (Sadece bir kez)
2. **expo prebuild çalıştırma** (Share Extension dosyaları otomatik oluşturulacak)
3. **Xcode'da build ve test**

---

## 🔧 Adım 1: Apple Developer Portal'da App Group Oluşturma

### 1.1. App Group Oluşturma
1. [Apple Developer Portal](https://developer.apple.com/account) → **Certificates, Identifiers & Profiles**
2. **Identifiers** → **App Groups** → **+** butonuna tıkla
3. **Description:** `OneLine Share Extension`
4. **Identifier:** `group.com.oneline.dailynotes`
5. **Continue** → **Register**

**ÖNEMLİ:** Bu adım sadece bir kez yapılmalı ve App Group identifier'ı `app.json`'daki ile tam olarak eşleşmeli.

---

## 🔧 Adım 2: Expo Prebuild ile Dosyaları Oluşturma

### 2.1. Prebuild Çalıştırma

Config plugin zaten `app.json`'da tanımlı. Share Extension dosyalarını oluşturmak için:

```bash
npx expo prebuild --clean
```

Bu komut:
- ✅ `ios/OneLineShareExtension/ShareViewController.swift` dosyasını oluşturur
- ✅ `ios/OneLineShareExtension/Info.plist` dosyasını yapılandırır
- ✅ `ios/OneLineShareExtension/OneLineShareExtension.entitlements` dosyasını oluşturur
- ✅ Main app'te App Groups capability'sini ekler (`app.json` → `ios.entitlements`)

**Not:** Xcode target'ı henüz oluşturulmadı, bu adımda sadece dosyalar oluşturulur.

### 2.2. Xcode'da Target Ekleme (Sadece Bir Kez)

Prebuild sonrası Xcode'da target ekleyin:

```bash
cd ios
open OneLine.xcworkspace
```

**Xcode'da:**
1. Sol panelde **OneLine** projesine sağ tıkla
2. **"Add Target..."** seçeneğini seç
3. **iOS** sekmesinde **"Share Extension"** seçeneğini bul ve seç
4. **Next** butonuna tıkla
5. **Product Name:** `OneLineShareExtension`
6. **Organization Identifier:** `com.oneline`
7. **Language:** Swift
8. **Embed in Application:** OneLine
9. **Next** → **Finish**

**ÖNEMLİ:** Eğer Xcode otomatik olarak `ShareViewController.swift` oluşturduysa:

1. **OneLineShareExtension** klasöründe `ShareViewController.swift` dosyası olup olmadığını kontrol edin
2. Eğer yoksa veya yanlışsa:
   - Sol panelde **OneLineShareExtension** klasörüne sağ tıkla → **Add Files to "OneLineShareExtension"...**
   - `ios/OneLineShareExtension/ShareViewController.swift` dosyasını seç
   - **Copy items if needed** işaretli olmalı
   - **OneLineShareExtension** target'ını seç
   - **Add**

3. **Info.plist** dosyasını kontrol edin:
   - Eğer `NSExtensionMainStoryboard` anahtarı varsa, bu storyboard-based versiyondur
   - `NSExtensionPrincipalClass` anahtarı olmalı (kod-based versiyon)
   - Eğer storyboard versiyonu varsa, `Info.plist` dosyasını plugin'in oluşturduğu versiyonla değiştirin

**Not:** Plugin dosyaları `expo prebuild` çalıştırıldığında otomatik oluşturulur. Eğer dosyalar yoksa, `npx expo prebuild` çalıştırın.

### 2.3. Build Settings Yapılandırması

1. **OneLineShareExtension** target'ını seç
2. **Build Settings** sekmesine git
3. **Product Bundle Identifier:** `com.oneline.dailynotes.ShareExtension` olmalı
4. **Info.plist File:** `OneLineShareExtension/Info.plist` olmalı
5. **Code Signing Entitlements:** `OneLineShareExtension/OneLineShareExtension.entitlements` olmalı

---

## 📝 Adım 3: ShareViewController.swift (Otomatik Oluşturuldu)

Config plugin tarafından otomatik oluşturulan `ShareViewController.swift` dosyası şu içeriğe sahip:

```swift
import UIKit
import Social
import MobileCoreServices

class ShareViewController: SLComposeServiceViewController {
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        // Share extension'ın başlığını ayarla
        self.title = "Add to OneLine"
    }
    
    override func isContentValid() -> Bool {
        // Kullanıcı içerik girdi mi kontrol et
        return true
    }
    
    override func didSelectPost() {
        // Kullanıcı "Post" butonuna bastığında çalışır
        
        guard let extensionItem = extensionContext?.inputItems.first as? NSExtensionItem else {
            self.extensionContext?.completeRequest(returningItems: nil, completionHandler: nil)
            return
        }
        
        var text: String?
        var url: String?
        var imageUris: [String] = []
        
        // Extension item'dan veri çıkar
        if let attachments = extensionItem.attachments {
            for attachment in attachments {
                // Text çıkar
                if attachment.hasItemConformingToTypeIdentifier(kUTTypeText as String) {
                    attachment.loadItem(forTypeIdentifier: kUTTypeText as String, options: nil) { (item, error) in
                        if let textItem = item as? String {
                            text = textItem
                        }
                    }
                }
                
                // URL çıkar
                if attachment.hasItemConformingToTypeIdentifier(kUTTypeURL as String) {
                    attachment.loadItem(forTypeIdentifier: kUTTypeURL as String, options: nil) { (item, error) in
                        if let urlItem = item as? URL {
                            url = urlItem.absoluteString
                        }
                    }
                }
                
                // Image çıkar
                if attachment.hasItemConformingToTypeIdentifier(kUTTypeImage as String) {
                    attachment.loadItem(forTypeIdentifier: kUTTypeImage as String, options: nil) { (item, error) in
                        if let imageItem = item as? UIImage {
                            // Image'i App Group'a kaydet
                            if let imageData = imageItem.jpegData(compressionQuality: 0.8) {
                                self.saveImageToAppGroup(imageData: imageData) { savedUri in
                                    if let uri = savedUri {
                                        imageUris.append(uri)
                                    }
                                }
                            }
                        } else if let imageUrl = item as? URL {
                            // Image URL'i
                            imageUris.append(imageUrl.absoluteString)
                        }
                    }
                }
            }
        }
        
        // App Group'a veri kaydet
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
            self.saveToAppGroup(text: text, url: url, imageUris: imageUris)
            
            // Extension'ı kapat
            self.extensionContext?.completeRequest(returningItems: nil, completionHandler: nil)
        }
    }
    
    func saveImageToAppGroup(imageData: Data, completion: @escaping (String?) -> Void) {
        guard let groupURL = FileManager.default.containerURL(forSecurityApplicationGroupIdentifier: "group.com.oneline.dailynotes") else {
            completion(nil)
            return
        }
        
        let filename = "share_\(Date().timeIntervalSince1970).jpg"
        let fileURL = groupURL.appendingPathComponent(filename)
        
        do {
            try imageData.write(to: fileURL)
            completion(fileURL.path)
        } catch {
            print("Error saving image: \(error)")
            completion(nil)
        }
    }
    
    func saveToAppGroup(text: String?, url: String?, imageUris: [String]) {
        guard let userDefaults = UserDefaults(suiteName: "group.com.oneline.dailynotes") else {
            return
        }
        
        var shareData: [String: Any] = [:]
        
        if let text = text, !text.isEmpty {
            shareData["text"] = text
        }
        
        if let url = url, !url.isEmpty {
            shareData["url"] = url
        }
        
        if !imageUris.isEmpty {
            shareData["imageUris"] = imageUris
        }
        
        shareData["timestamp"] = Date().timeIntervalSince1970
        
        userDefaults.set(shareData, forKey: "pendingShareData")
        userDefaults.synchronize()
        
        // Main app'i açmak için URL scheme kullan
        if let url = URL(string: "oneline://capture") {
            _ = self.openURL(url)
        }
    }
    
    @objc func openURL(_ url: URL) -> Bool {
        var responder: UIResponder? = self
        while responder != nil {
            if let application = responder as? UIApplication {
                return application.perform(#selector(openURL(_:)), with: url) != nil
            }
            responder = responder?.next
        }
        return false
    }
    
    override func configurationItems() -> [Any]! {
        // Ekstra configuration item'lar eklemek isterseniz buraya ekleyin
        return []
    }
}
```

**Not:** Bu dosya config plugin tarafından otomatik oluşturulur. Manuel değişiklik yaparsanız, `expo prebuild --clean` sonrası kaybolacaktır.

Eğer değişiklik yapmak isterseniz, `plugins/withShareExtension.js` dosyasındaki `swiftContent` değişkenini düzenleyin.

---

## ⚙️ Adım 4: Info.plist (Otomatik Yapılandırıldı)

Config plugin tarafından otomatik oluşturulan `Info.plist` dosyası şu ayarlara sahip:
- ✅ `NSExtensionActivationSupportsText`: true
- ✅ `NSExtensionActivationSupportsImageWithMaxCount`: 10
- ✅ `NSExtensionActivationSupportsWebURLWithMaxCount`: 1
- ✅ `NSExtensionPrincipalClass`: ShareViewController

**Not:** Bu dosya config plugin tarafından otomatik oluşturulur. Manuel değişiklik yaparsanız, `expo prebuild --clean` sonrası kaybolacaktır.

---

## 🔗 Adım 5: App Groups (Otomatik Yapılandırıldı)

Config plugin tarafından otomatik olarak:
- ✅ Main app'te App Groups capability eklendi (`app.json` → `ios.entitlements`)
- ✅ Share Extension'da App Groups capability eklendi (entitlements dosyası)

**ÖNEMLİ:** Apple Developer Portal'da App Group oluşturulmalı (Adım 1). Xcode'da otomatik olarak görünecektir.

---

## 📱 Adım 6: Xcode'da Signing Yapılandırması

### 6.1. Main App Signing
1. Xcode'da **OneLine** target'ını seç
2. **Signing & Capabilities** sekmesine git
3. **Team** seç (Apple Developer hesabınız)
4. **Automatically manage signing** aktif olmalı
5. App Groups capability'si otomatik görünmeli

### 6.2. Share Extension Signing
1. Xcode'da **OneLineShareExtension** target'ını seç
2. **Signing & Capabilities** sekmesine git
3. **Team** seç (Main app ile aynı)
4. **Automatically manage signing** aktif olmalı
5. App Groups capability'si otomatik görünmeli

**ÖNEMLİ:** Her iki target'ta da aynı Team ve App Group kullanılmalı.

---

## 📱 Adım 7: Main App'te Share Data Okuma

Main app'te (React Native tarafında) App Group'dan veri okumak için `useShareIntent` hook'u zaten hazır. Ancak iOS Share Extension'dan gelen veriyi okumak için ek bir kontrol eklememiz gerekiyor.

### 5.1. useShareIntent Hook'unu Güncelleme

`src/hooks/useShareIntent.ts` dosyasına iOS App Group kontrolü eklenmeli. Ancak bu React Native tarafında yapılamaz, native module gerektirir.

**Alternatif Çözüm:** Share Extension, veriyi App Group'a kaydettikten sonra `oneline://capture` URL scheme'i ile main app'i açar. Main app bu URL'i yakalayıp App Group'dan veriyi okur.

### 5.2. Native Module Oluşturma (Opsiyonel)

Eğer direkt App Group'dan okumak isterseniz, bir native module oluşturmanız gerekir:

**ios/OneLine/ShareDataModule.swift:**
```swift
import Foundation
import React

@objc(ShareDataModule)
class ShareDataModule: NSObject {
    
    @objc
    static func requiresMainQueueSetup() -> Bool {
        return false
    }
    
    @objc
    func getPendingShareData(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        guard let userDefaults = UserDefaults(suiteName: "group.com.oneline.dailynotes") else {
            reject("NO_APP_GROUP", "App Group not found", nil)
            return
        }
        
        if let shareData = userDefaults.dictionary(forKey: "pendingShareData") {
            userDefaults.removeObject(forKey: "pendingShareData")
            userDefaults.synchronize()
            resolve(shareData)
        } else {
            resolve(nil)
        }
    }
}
```

**ios/OneLine/ShareDataModule.m:**
```objc
#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(ShareDataModule, NSObject)

RCT_EXTERN_METHOD(getPendingShareData:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

@end
```

---

## 🧪 Adım 8: Test Etme

### 6.1. Build ve Run
1. Xcode'da **OneLine** scheme'ini seç
2. **Product** → **Run** (⌘R)
3. Uygulama simülatörde veya cihazda açılacak

### 6.2. Share Extension'ı Test Etme
1. Safari'de bir web sayfası aç
2. **Share** butonuna tıkla
3. Share sheet'te **OneLine** seçeneğini görmelisiniz
4. **Add to OneLine** butonuna tıkla
5. Paylaşılan içerik OneLine'da capture screen'de görünmeli

### 6.3. Farklı İçerik Tiplerini Test Etme
- **Text:** Notes uygulamasından text paylaş
- **URL:** Safari'den link paylaş
- **Image:** Photos'tan image paylaş
- **Multiple Images:** Photos'tan birden fazla image seç ve paylaş

---

## ⚠️ Yaygın Sorunlar ve Çözümleri

### Sorun 1: Share Extension görünmüyor
**Çözüm:**
- Info.plist'te `NSExtensionActivationRule` doğru yapılandırılmış mı kontrol et
- Share Extension target'ının build edildiğinden emin ol
- Cihazı yeniden başlat

### Sorun 2: App Group çalışmıyor
**Çözüm:**
- Apple Developer Portal'da App Group oluşturuldu mu kontrol et
- Her iki target'ta da aynı App Group identifier kullanılıyor mu kontrol et
- Provisioning profile'ların App Group'u içerdiğinden emin ol

### Sorun 3: Image kaydedilmiyor
**Çözüm:**
- App Group container URL'inin doğru olduğundan emin ol
- File permissions kontrol et
- Image data'nın doğru format'ta olduğundan emin ol

### Sorun 4: Main app açılmıyor
**Çözüm:**
- `app.json`'da `scheme: "oneline"` tanımlı mı kontrol et
- URL scheme'in doğru çağrıldığından emin ol
- Deep linking hook'unun çalıştığından emin ol

---

## 📝 Özet Checklist

- [ ] Apple Developer Portal'da App Group oluşturuldu (`group.com.oneline.dailynotes`)
- [ ] `expo prebuild --clean` çalıştırıldı
- [ ] Xcode'da Share Extension target'ı görünüyor
- [ ] ShareViewController.swift dosyası mevcut
- [ ] Info.plist doğru yapılandırılmış
- [ ] Her iki target'ta da App Groups capability görünüyor
- [ ] Signing yapılandırıldı (Team seçildi)
- [ ] Build ve test edildi
- [ ] Farklı içerik tipleri test edildi

---

## 🔄 Sonraki Adımlar

Share Extension çalıştıktan sonra:
1. Main app'te App Group'dan veri okuma implementasyonu
2. Error handling iyileştirmeleri
3. UI/UX iyileştirmeleri
4. Performance optimizasyonları

---

## 🔄 Expo Prebuild Sonrası

Her `expo prebuild --clean` çalıştırdığınızda:
- ✅ Share Extension dosyaları otomatik yeniden oluşturulur
- ✅ Config plugin ayarları uygulanır
- ✅ Xcode'da manuel değişiklikler kaybolur (bu normaldir)

**Öneri:** Native dosyalarda değişiklik yapmak isterseniz, `plugins/withShareExtension.js` dosyasını düzenleyin.

---

## 📚 Config Plugin Detayları

Config plugin (`plugins/withShareExtension.js`) şunları yapar:
1. Share Extension target'ını Xcode project'e ekler
2. `ShareViewController.swift` dosyasını oluşturur
3. `Info.plist` dosyasını yapılandırır
4. Entitlements dosyasını oluşturur
5. App Groups capability'sini ekler
6. Build settings'i yapılandırır

Plugin'i özelleştirmek için `plugins/withShareExtension.js` dosyasını düzenleyin.

---

**Not:** Bu adımlar tamamlandıktan sonra, React Native tarafındaki `useShareIntent` hook'u otomatik olarak çalışacak ve paylaşılan içerik OneLine'a eklenecektir.
