/** @type {import('@capacitor/cli').CapacitorConfig} */
const config = {
  appId: 'com.resealience.mpa',
  appName: 'resealience MPA',
  webDir: 'dist',
  plugins: {
    StatusBar: {
      overlaysWebView: false,
      backgroundColor: '#fffdf9',
      style: 'LIGHT',
    },
  },
};

export default config;