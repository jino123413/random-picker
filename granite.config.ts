import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  appName: 'random-picker1',
  web: {
    host: '0.0.0.0',
    port: 3002,
    commands: {
      dev: 'rsbuild dev --host',
      build: 'rsbuild build',
    },
  },
  permissions: [],
  outdir: 'dist',
  brand: {
    displayName: '골라줘',
    icon: 'https://raw.githubusercontent.com/jino123413/app-logos/master/random-picker.png',
    primaryColor: '#FF4081',
    bridgeColorMode: 'basic',
  },
  webViewProps: {
    type: 'partner',
  },
});
