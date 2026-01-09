const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Ensure cache directory is properly handled
config.cacheStores = [];

module.exports = withNativeWind(config, {
  input: "./global.css",
  // Disable file system writes for production builds (fixes Vercel deployment)
  forceWriteFileSystem: false,
});
