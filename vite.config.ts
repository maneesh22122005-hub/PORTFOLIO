import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    // Preserve class/function names during minification.
    // Terser's default name-mangling can collide class names across
    // chunks (three.js / postprocessing / troika-three-text all define
    // many classes), which breaks `instanceof` and constructor checks
    // and causes runtime errors like:
    //   "Class constructor X cannot be invoked without 'new'"
    minify: 'terser',
    terserOptions: {
      keep_classnames: true,
      keep_fnames: true,
    },
  },
})
