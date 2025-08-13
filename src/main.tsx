import { createRoot } from 'react-dom/client'
import { Capacitor } from '@capacitor/core'
import App from './App.tsx'
import './index.css'

// Initialize Capacitor for mobile app
if (Capacitor.isNativePlatform()) {
  console.log('Running as native app')
} else {
  console.log('Running as web app')
}

createRoot(document.getElementById("root")!).render(<App />);
