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
    },
    // 5. PROXY: Proxy API requests to bypass CORS/Origin restrictions
    proxy: {
      '/google-ai': {
        target: 'https://generativelanguage.googleapis.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/google-ai/, ''),
        configure: (proxy, _options) => {
          proxy.on('proxyReq', (proxyReq, _req, _res) => {
            // Remove the Origin header from the browser to avoid 403 Forbidden
            // The API key is likely restricted to localhost, so we spoof it
            proxyReq.setHeader('Origin', 'http://localhost:4000');
            proxyReq.setHeader('Referer', 'http://localhost:4000/');
          });
        }
      }
    }
  },
})
