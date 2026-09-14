// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

// Obtén la configuración base de Expo
const config = getDefaultConfig(__dirname);

// Aplica el preset de NativeWind
module.exports = withNativeWind(config, { input: './global.css' });