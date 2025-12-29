import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // 1. HOST: true exposes the app to your local network (and internet via port forwarding)
    host: true, 
    // 2. PORT: Standardize the port (e.g., 3000) so your router settings are easier
    port: 4000,
    // 3. ALLOWED HOSTS: Whitelist your DDNS domain to prevent "Blocked Request" errors
    allowedHosts: [
      'bryan-desktop.ddns.net'
    ],
    // 4. SECURITY HEADERS: Protect against clickjacking and other attacks
    headers: {
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
    }
  },
})
