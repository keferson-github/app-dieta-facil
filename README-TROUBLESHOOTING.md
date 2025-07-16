# Troubleshooting - App Dieta Fácil

## Erro: "Cannot read properties of undefined (reading 'createContext')"

### Problema
Erro que ocorria no arquivo `vendor-other-BqKtWlTU.js` relacionado ao `createContext` ser undefined.

### Causa
O problema era causado pela configuração do Vite que estava dividindo o React em chunks separados, resultando em múltiplas instâncias do React sendo carregadas no navegador. Isso causava conflitos com contextos do React.

### Solução Implementada
1. **Modificação do `vite.config.ts`:**
   - Agrupamos todos os pacotes relacionados ao React (`react`, `react-dom`, `react-router`, `react-hook-form`, `react-i18next`) no mesmo chunk `vendor-react`
   - Adicionamos aliases no `resolve` para garantir que apenas uma instância do React seja usada
   - Configuramos `optimizeDeps` com `force: true` para forçar o pre-bundling

2. **Configuração de Chunks:**
   ```typescript
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
     // ... outros chunks
   }
   ```

3. **Aliases para React:**
   ```typescript
   resolve: {
     alias: {
       "@": path.resolve(__dirname, "./src"),
       "react": path.resolve(__dirname, "node_modules/react"),
       "react-dom": path.resolve(__dirname, "node_modules/react-dom"),
     },
   }
   ```

### Prevenção
- **NUNCA** separe pacotes relacionados ao React em chunks diferentes
- Sempre mantenha `react`, `react-dom` e bibliotecas que dependem de contextos do React no mesmo chunk
- Use aliases para garantir que apenas uma instância do React seja carregada

### Como Verificar se o Problema Foi Resolvido
1. Execute `npm run build`
2. Execute `npm run preview`
3. Abra o navegador em `http://localhost:4173`
4. Abra o console do desenvolvedor (F12)
5. Verifique se não há erros relacionados ao `createContext`

### Comandos Úteis
```bash
# Build limpo
npm run build

# Preview da build de produção
npm run preview

# Desenvolvimento
npm run dev
```

### Arquivos Modificados
- `vite.config.ts` - Configuração principal do bundling
