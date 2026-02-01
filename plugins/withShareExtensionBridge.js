const { withXcodeProject } = require("@expo/config-plugins");
const fs = require("fs");
const path = require("path");

/**
 * Expo config plugin to register ShareExtensionBridge module
 */
const withShareExtensionBridge = (config) => {
  // The module is already created, we just need to ensure it's registered
  // Expo Modules should auto-discover it, but if not, we can manually register it
  return config;
};

module.exports = withShareExtensionBridge;
