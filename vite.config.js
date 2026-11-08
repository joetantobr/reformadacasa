import { defineConfig } from 'vite';

// O Lovable roda o servidor de desenvolvimento na porta 8080.
export default defineConfig({
  server: { host: '::', port: 8080 },
});
