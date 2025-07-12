import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Carregar variáveis de ambiente
  const env = loadEnv(mode, process.cwd(), '');

  // Checagem obrigatória das variáveis sensíveis
  if (!env.VITE_SUPABASE_URL || !env.VITE_SUPABASE_ANON_KEY) {
    throw new Error('As variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY são obrigatórias. Defina-as no seu .env.');
  }

  return {
    server: {
      host: "::",
      port: 8080,
    },
    plugins: [
      react(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      // Evitar conflitos de minificação
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: mode === 'production',
          drop_debugger: mode === 'production',
        },
      },
      // Melhorar compatibilidade
      target: 'es2015',
      // Evitar problemas com chunks grandes
      rollupOptions: {
        output: {
          manualChunks: {
            'supabase': ['@supabase/supabase-js'],
            'react-vendor': ['react', 'react-dom'],
            'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
          },
        },
      },
    },
    // Configurações para evitar cache em desenvolvimento
    optimizeDeps: {
      include: ['@supabase/supabase-js'],
      force: mode === 'development',
    },
    define: {
      // Garantir que as variáveis sejam sempre definidas
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL),
      'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY),
      'import.meta.env.VITE_APP_URL': JSON.stringify(env.VITE_APP_URL || ''),
      'import.meta.env.MODE': JSON.stringify(mode),
    },
  };
});
