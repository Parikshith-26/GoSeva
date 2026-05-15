import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.goseva.app',
  appName: 'GoSeva',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
