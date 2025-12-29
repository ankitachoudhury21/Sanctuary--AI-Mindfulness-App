import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // ADD THIS SECTION:
  define: {
    'process.env': {}, // unexpected fix for some libraries
    'import.meta.env.VITE_SHOPIFY_API_KEY': JSON.stringify('YOUR_ACTUAL_KEY_HERE')
  }
})
