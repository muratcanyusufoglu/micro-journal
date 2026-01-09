const {
  withInfoPlist,
  withDangerousMod,
} = require("@expo/config-plugins");
const fs = require("fs");
const path = require("path");

/**
 * Expo config plugin to add iOS Share Extension
 * 
 * This plugin:
 * 1. Adds App Groups capability to main app (via app.json)
 * 2. Creates Share Extension files (ShareViewController.swift, Info.plist, entitlements)
 * 
 * Note: Xcode target must be added manually once, but files are auto-generated.
 */
const withShareExtension = (config) => {
  // Add App Groups capability to main app (already in app.json)
  // This is handled via app.json ios.entitlements

  // Add Share Extension files
  config = withDangerousMod(config, [
    "ios",
    async (config) => {
      await createShareExtensionFiles(config.modRequest.platformProjectRoot);
      return config;
    },
  ]);

  return config;
};

function withAppGroups(config, { groups }) {
  if (!config.ios) {
    config.ios = {};
  }
  if (!config.ios.entitlements) {
    config.ios.entitlements = {};
  }
  if (!config.ios.entitlements["com.apple.security.application-groups"]) {
    config.ios.entitlements["com.apple.security.application-groups"] = groups;
  }
  return config;
}

// Xcode target manipulation is complex and error-prone.
// Instead, we create the files and let the user add the target manually once.
// The files will be preserved across prebuild runs.

async function createShareExtensionFiles(iosProjectPath) {
  const extensionName = "OneLineShareExtension";
  const extensionPath = path.join(iosProjectPath, extensionName);

  // Create directory
  if (!fs.existsSync(extensionPath)) {
    fs.mkdirSync(extensionPath, { recursive: true });
  }

  // Create ShareViewController.swift
  const swiftContent = `import UIKit
import Social
import MobileCoreServices

class ShareViewController: SLComposeServiceViewController {
    
    override func viewDidLoad() {
        super.viewDidLoad()
        self.title = "Add to OneLine"
    }
    
    override func isContentValid() -> Bool {
        return true
    }
    
    override func didSelectPost() {
        guard let extensionItem = extensionContext?.inputItems.first as? NSExtensionItem else {
            self.extensionContext?.completeRequest(returningItems: nil, completionHandler: nil)
            return
        }
        
        var text: String?
        var url: String?
        var imageUris: [String] = []
        
        if let attachments = extensionItem.attachments {
            for attachment in attachments {
                if attachment.hasItemConformingToTypeIdentifier(kUTTypeText as String) {
                    attachment.loadItem(forTypeIdentifier: kUTTypeText as String, options: nil) { (item, error) in
                        if let textItem = item as? String {
                            text = textItem
                        }
                    }
                }
                
                if attachment.hasItemConformingToTypeIdentifier(kUTTypeURL as String) {
                    attachment.loadItem(forTypeIdentifier: kUTTypeURL as String, options: nil) { (item, error) in
                        if let urlItem = item as? URL {
                            url = urlItem.absoluteString
                        }
                    }
                }
                
                if attachment.hasItemConformingToTypeIdentifier(kUTTypeImage as String) {
                    attachment.loadItem(forTypeIdentifier: kUTTypeImage as String, options: nil) { (item, error) in
                        if let imageItem = item as? UIImage {
                            if let imageData = imageItem.jpegData(compressionQuality: 0.8) {
                                self.saveImageToAppGroup(imageData: imageData) { savedUri in
                                    if let uri = savedUri {
                                        imageUris.append(uri)
                                    }
                                }
                            }
                        } else if let imageUrl = item as? URL {
                            imageUris.append(imageUrl.absoluteString)
                        }
                    }
                }
            }
        }
        
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
            self.saveToAppGroup(text: text, url: url, imageUris: imageUris)
            self.extensionContext?.completeRequest(returningItems: nil, completionHandler: nil)
        }
    }
    
    func saveImageToAppGroup(imageData: Data, completion: @escaping (String?) -> Void) {
        guard let groupURL = FileManager.default.containerURL(forSecurityApplicationGroupIdentifier: "group.com.oneline.dailynotes") else {
            completion(nil)
            return
        }
        
        let filename = "share_\\(Date().timeIntervalSince1970).jpg"
        let fileURL = groupURL.appendingPathComponent(filename)
        
        do {
            try imageData.write(to: fileURL)
            completion(fileURL.path)
        } catch {
            print("Error saving image: \\(error)")
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
        return []
    }
}
`;

  fs.writeFileSync(
    path.join(extensionPath, "ShareViewController.swift"),
    swiftContent
  );

  // Create Info.plist
  const infoPlistContent = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleDevelopmentRegion</key>
    <string>$(DEVELOPMENT_LANGUAGE)</string>
    <key>CFBundleDisplayName</key>
    <string>OneLine Share</string>
    <key>CFBundleExecutable</key>
    <string>$(EXECUTABLE_NAME)</string>
    <key>CFBundleIdentifier</key>
    <string>$(PRODUCT_BUNDLE_IDENTIFIER)</string>
    <key>CFBundleInfoDictionaryVersion</key>
    <string>6.0</string>
    <key>CFBundleName</key>
    <string>$(PRODUCT_NAME)</string>
    <key>CFBundlePackageType</key>
    <string>$(PRODUCT_BUNDLE_PACKAGE_TYPE)</string>
    <key>CFBundleShortVersionString</key>
    <string>1.0</string>
    <key>CFBundleVersion</key>
    <string>1</string>
    <key>NSExtension</key>
    <dict>
        <key>NSExtensionAttributes</key>
        <dict>
            <key>NSExtensionActivationRule</key>
            <dict>
                <key>NSExtensionActivationSupportsText</key>
                <true/>
                <key>NSExtensionActivationSupportsImageWithMaxCount</key>
                <integer>10</integer>
                <key>NSExtensionActivationSupportsWebURLWithMaxCount</key>
                <integer>1</integer>
            </dict>
        </dict>
        <key>NSExtensionPrincipalClass</key>
        <string>$(PRODUCT_MODULE_NAME).ShareViewController</string>
        <key>NSExtensionPointIdentifier</key>
        <string>com.apple.share-services</string>
    </dict>
</dict>
</plist>
`;

  fs.writeFileSync(
    path.join(extensionPath, "Info.plist"),
    infoPlistContent
  );

  // Create entitlements file
  const entitlementsContent = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>com.apple.security.application-groups</key>
    <array>
        <string>group.com.oneline.dailynotes</string>
    </array>
</dict>
</plist>
`;

  fs.writeFileSync(
    path.join(extensionPath, `${extensionName}.entitlements`),
    entitlementsContent
  );
}

module.exports = withShareExtension;
