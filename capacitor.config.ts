import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.barberapp.agendamentos',
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
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#1a1a1a'
    }
  }
};

export default config;