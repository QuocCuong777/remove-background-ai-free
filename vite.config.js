import { defineConfig } from 'vite';

export default defineConfig({
  // Dev server configuration
  server: {
    port: 3000,
    open: true,
    // Required headers for multi-threaded WASM (SharedArrayBuffer)
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
  },

  // Preview server (for testing production build)
  preview: {
    port: 4173,
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
  },

  // Build configuration
  build: {
    target: 'esnext',
    outDir: 'dist',
    assetsInlineLimit: 0, // Don't inline any assets (important for WASM files)
    rollupOptions: {
      output: {
        // Keep chunk names readable
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
  },

  // Optimize dependency pre-bundling
  optimizeDeps: {
    exclude: ['@imgly/background-removal'],
  },

  // Worker configuration for Web Workers used by ONNX Runtime
  worker: {
    format: 'es',
  },
});
