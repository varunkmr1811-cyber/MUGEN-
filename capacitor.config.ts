import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.mugen.habittracker',
  appName: 'MUGEN',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#070a12',
      androidSplashResourceName: 'splash',
      showSpinner: false,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#070a12',
    },
    Keyboard: {
      resize: 'body',
      style: 'DARK',
    },
  },
  android: {
    backgroundColor: '#070a12',
    allowMixedContent: true,
    webContentsDebuggingEnabled: false,
  },
};

export default config;
