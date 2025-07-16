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
      // Garantir que apenas uma instância do React seja usada
      "react": path.resolve(__dirname, "node_modules/react"),
      "react-dom": path.resolve(__dirname, "node_modules/react-dom"),
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react/jsx-runtime'],
    // Forçar pre-bundling dos pacotes React para evitar problemas de contexto
    force: true,
  },
  build: {
    target: 'esnext',
    minify: 'esbuild',
    rollupOptions: {
      external: [],
      output: {
        manualChunks: (id) => {
          // React core - IMPORTANTE: manter todos juntos para evitar problemas de contexto
          if (id.includes('react') || 
              id.includes('react-dom') || 
              id.includes('react/jsx-runtime') ||
              id.includes('react-router') ||
              id.includes('react-hook-form') ||
              id.includes('react-i18next')) {
            return 'vendor-react';
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
          if (id.includes('i18next')) {
            return 'i18n';
          }
          
          // Supabase
          if (id.includes('@supabase')) {
            return 'supabase';
          }
          
          // Form utilities
          if (id.includes('@hookform/resolvers') ||
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
