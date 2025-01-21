import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: '../public', // Output to a public directory at the root
  },
  server:{
    port:8000,
    proxy: {
      "/api": {
        target:"http://localhost:5000",
        changeOrigin:true,
      },
    },
  },
});
