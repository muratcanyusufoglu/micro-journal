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
 * Note: Xcode target must be added manually once, but files are auto-generated and preserved.
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

async function createShareExtensionFiles(iosProjectPath) {
  const extensionName = "OneLineShareExtension";
  const extensionPath = path.join(iosProjectPath, extensionName);

  // Create directory
  if (!fs.existsSync(extensionPath)) {
    fs.mkdirSync(extensionPath, { recursive: true });
  }

  // Create ShareViewController.swift with proper implementation
  const swiftContent = `//
//  ShareViewController.swift
//  OneLineShareExtension
//
//  Created by Muratcan Yusufoglu on 27.01.2026.
//

import UIKit
import Social
import UniformTypeIdentifiers

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
        let group = DispatchGroup()
        
        // Get text from contentText (user input in share sheet)
        if let contentText = self.contentText, !contentText.isEmpty {
            text = contentText
        }
        
        if let attachments = extensionItem.attachments {
            for attachment in attachments {
                if attachment.hasItemConformingToTypeIdentifier(UTType.text.identifier) {
                    group.enter()
                    attachment.loadItem(forTypeIdentifier: UTType.text.identifier, options: nil) { (item, error) in
                        if let textItem = item as? String {
                            text = textItem
                        }
                        group.leave()
                    }
                }
                
                if attachment.hasItemConformingToTypeIdentifier(UTType.url.identifier) {
                    group.enter()
                    attachment.loadItem(forTypeIdentifier: UTType.url.identifier, options: nil) { (item, error) in
                        if let urlItem = item as? URL {
                            url = urlItem.absoluteString
                        }
                        group.leave()
                    }
                }
                
                if attachment.hasItemConformingToTypeIdentifier(UTType.image.identifier) {
                    group.enter()
                    attachment.loadItem(forTypeIdentifier: UTType.image.identifier, options: nil) { (item, error) in
                        if let imageItem = item as? UIImage {
                            if let imageData = imageItem.jpegData(compressionQuality: 0.8) {
                                self.saveImageToAppGroup(imageData: imageData) { savedUri in
                                    if let uri = savedUri {
                                        imageUris.append(uri)
                                    }
                                    group.leave()
                                }
                            } else {
                                group.leave()
                            }
                        } else if let imageUrl = item as? URL {
                            imageUris.append(imageUrl.absoluteString)
                            group.leave()
                        } else {
                            group.leave()
                        }
                    }
                }
            }
        }
        
        group.notify(queue: .main) {
            self.sendDataToMainApp(text: text, url: url, imageUris: imageUris) { success in
                print("Share Extension: Data sent, completing extension. Success: \\(success)")
                // Complete the extension after a small delay to ensure URL is opened
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) {
                    self.extensionContext?.completeRequest(returningItems: nil, completionHandler: nil)
                }
            }
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
    
    func sendDataToMainApp(text: String?, url: String?, imageUris: [String], completion: @escaping (Bool) -> Void) {
        var urlComponents = URLComponents(string: "oneline://capture")!
        var queryItems: [URLQueryItem] = []
        
        if let text = text, !text.isEmpty {
            if let encodedText = text.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) {
                queryItems.append(URLQueryItem(name: "text", value: encodedText))
                print("Share Extension: Adding text parameter: \\(text)")
            }
        }
        
        if let url = url, !url.isEmpty {
            if let encodedUrl = url.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) {
                queryItems.append(URLQueryItem(name: "url", value: encodedUrl))
                print("Share Extension: Adding URL parameter: \\(url)")
            }
        }
        
        if !imageUris.isEmpty {
            let imagePaths = imageUris.joined(separator: ",")
            if let encodedPaths = imagePaths.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) {
                queryItems.append(URLQueryItem(name: "imageUris", value: encodedPaths))
                print("Share Extension: Adding \\(imageUris.count) image(s)")
            }
        }
        
        if !queryItems.isEmpty {
            urlComponents.queryItems = queryItems
        }
        
        if let finalURL = urlComponents.url {
            print("Share Extension: Opening URL: \\(finalURL.absoluteString)")
            // Use extensionContext to open URL in main app
            self.extensionContext?.open(finalURL, completionHandler: { success in
                print("Share Extension: URL opened successfully: \\(success)")
                completion(success)
            })
        } else {
            print("Share Extension: Failed to create final URL")
            completion(false)
        }
    }
    
    override func configurationItems() -> [Any]! {
        return []
    }
}
`;

  const swiftFilePath = path.join(extensionPath, "ShareViewController.swift");
  // Only write if file doesn't exist or content is different
  if (!fs.existsSync(swiftFilePath) || fs.readFileSync(swiftFilePath, "utf8") !== swiftContent) {
    fs.writeFileSync(swiftFilePath, swiftContent);
  }

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
    <key>LSApplicationQueriesSchemes</key>
    <array>
        <string>oneline</string>
    </array>
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

  const infoPlistPath = path.join(extensionPath, "Info.plist");
  // Only write if file doesn't exist or content is different
  if (!fs.existsSync(infoPlistPath) || fs.readFileSync(infoPlistPath, "utf8") !== infoPlistContent) {
    fs.writeFileSync(infoPlistPath, infoPlistContent);
  }

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

  const entitlementsPath = path.join(extensionPath, `${extensionName}.entitlements`);
  // Only write if file doesn't exist or content is different
  if (!fs.existsSync(entitlementsPath) || fs.readFileSync(entitlementsPath, "utf8") !== entitlementsContent) {
    fs.writeFileSync(entitlementsPath, entitlementsContent);
  }
}

module.exports = withShareExtension;
