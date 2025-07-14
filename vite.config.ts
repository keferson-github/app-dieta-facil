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
  build: {
    target: 'esnext',
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // React core
          if (id.includes('react') || id.includes('react-dom')) {
            return 'vendor-react';
          }
          
          // Router
          if (id.includes('react-router')) {
            return 'vendor-router';
          }
          
          // Radix UI Components (dividir em grupos menores)
          if (id.includes('@radix-ui/react-dialog') || 
              id.includes('@radix-ui/react-alert-dialog') ||
              id.includes('@radix-ui/react-popover') ||
              id.includes('@radix-ui/react-tooltip') ||
              id.includes('@radix-ui/react-hover-card')) {
            return 'ui-dialogs';
          }
          
          if (id.includes('@radix-ui/react-dropdown-menu') || 
              id.includes('@radix-ui/react-menubar') ||
              id.includes('@radix-ui/react-navigation-menu') ||
              id.includes('@radix-ui/react-context-menu')) {
            return 'ui-navigation';
          }
          
          if (id.includes('@radix-ui/react-select') || 
              id.includes('@radix-ui/react-checkbox') ||
              id.includes('@radix-ui/react-radio-group') ||
              id.includes('@radix-ui/react-switch') ||
              id.includes('@radix-ui/react-slider')) {
            return 'ui-forms';
          }
          
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
          
          // Date utilities
          if (id.includes('date-fns') || id.includes('react-day-picker')) {
            return 'date-utils';
          }
          
          // Form utilities
          if (id.includes('react-hook-form') || 
              id.includes('@hookform/resolvers') ||
              id.includes('zod')) {
            return 'form-utils';
          }
          
          // Other utilities
          if (id.includes('clsx') || 
              id.includes('tailwind-merge') ||
              id.includes('class-variance-authority') ||
              id.includes('cmdk') ||
              id.includes('input-otp') ||
              id.includes('sonner') ||
              id.includes('vaul')) {
            return 'utils';
          }
          
          // Carousel and panels
          if (id.includes('embla-carousel') || 
              id.includes('react-resizable-panels')) {
            return 'ui-advanced';
          }
          
          // Themes
          if (id.includes('next-themes')) {
            return 'themes';
          }
          
          // Country flags
          if (id.includes('react-country-flag')) {
            return 'country-utils';
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
