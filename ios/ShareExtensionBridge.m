//
//  ShareExtensionBridge.m
//  OneLine
//
//  Created by Muratcan Yusufoglu on 29.01.2026.
//

#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(ShareExtensionBridge, NSObject)

RCT_EXTERN_METHOD(checkPendingShare:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(clearPendingShare:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

+ (BOOL)requiresMainQueueSetup
{
  return NO;
}

@end
