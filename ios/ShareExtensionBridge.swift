//
//  ShareExtensionBridge.swift
//  OneLine
//
//  Created by Muratcan Yusufoglu on 29.01.2026.
//

import Foundation
import ExpoModulesCore

public class ShareExtensionBridge: Module {
  private let appGroupIdentifier = "group.com.oneline.dailynotes"
  private let pendingShareKey = "pendingShareData"
  
  public func definition() -> ModuleDefinition {
    Name("ShareExtensionBridge")
    
    // Check if there's pending share data
    AsyncFunction("checkPendingShare") { () -> [String: Any]? in
      NSLog("📱 ShareExtensionBridge: Checking for pending share data")
      
      guard let sharedDefaults = UserDefaults(suiteName: self.appGroupIdentifier) else {
        NSLog("❌ ShareExtensionBridge: Failed to access App Group UserDefaults")
        return nil
      }
      
      guard let shareData = sharedDefaults.dictionary(forKey: self.pendingShareKey) else {
        NSLog("📱 ShareExtensionBridge: No pending share data found")
        return nil
      }
      
      NSLog("✅ ShareExtensionBridge: Found pending share data: \(shareData)")
      return shareData
    }
    
    // Clear pending share data after processing
    AsyncFunction("clearPendingShare") {
      NSLog("📱 ShareExtensionBridge: Clearing pending share data")
      
      guard let sharedDefaults = UserDefaults(suiteName: self.appGroupIdentifier) else {
        NSLog("❌ ShareExtensionBridge: Failed to access App Group UserDefaults")
        return
      }
      
      sharedDefaults.removeObject(forKey: self.pendingShareKey)
      sharedDefaults.synchronize()
      
      NSLog("✅ ShareExtensionBridge: Pending share data cleared")
    }
  }
}
