import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.a7f147b1995341cca4654f5d6f6a458d',
  appName: 'BARBER TESTE',
  webDir: 'dist',
  server: {
    url: 'https://a7f147b1-9953-41cc-a465-4f5d6f6a458d.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#1a1a1a",
      showSpinner: false
    }
  }
};

export default config;