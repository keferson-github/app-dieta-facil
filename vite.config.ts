import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(() => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react/jsx-runtime'],
  },
  build: {
    target: 'esnext',
    minify: 'esbuild',
    rollupOptions: {
      external: [],
      output: {
        manualChunks: (id) => {
          // React core - manter juntos para evitar problemas de contexto
          if (id.includes('react') || id.includes('react-dom')) {
            return 'vendor-react';
          }
          
          // Router
          if (id.includes('react-router')) {
            return 'vendor-router';
          }
          
          // Radix UI Components - manter agrupados por funcionalidade
          if (id.includes('@radix-ui')) {
            return 'ui-radix';
          }
          
          // Ícones
          if (id.includes('lucide-react')) {
            return 'icons';
          }
          
          // Charts
          if (id.includes('recharts')) {
            return 'charts';
          }
          
          // Query
          if (id.includes('@tanstack/react-query')) {
            return 'query';
          }
          
          // Internacionalização
          if (id.includes('i18next') || id.includes('react-i18next')) {
            return 'i18n';
          }
          
          // Supabase
          if (id.includes('@supabase')) {
            return 'supabase';
          }
          
          // Form utilities
          if (id.includes('react-hook-form') || 
              id.includes('@hookform/resolvers') ||
              id.includes('zod')) {
            return 'form-utils';
          }
          
          // Node modules default
          if (id.includes('node_modules')) {
            return 'vendor-other';
          }
        }
      }
    },
    // Configurar limite de chunk size warning
    chunkSizeWarningLimit: 800,
    
    // Otimizações adicionais
    cssCodeSplit: true,
    assetsInlineLimit: 4096,
    
    // Configurações de sourcemap para produção
    sourcemap: false
  }
}));
