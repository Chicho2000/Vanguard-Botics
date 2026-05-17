import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from "url"

// https://vite.dev/config/
export default defineConfig({
  base: '/~tres/', // TODO: Reemplaza "usuario" por tu nombre de usuario del servidor (ej. uno, dos)
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
})
