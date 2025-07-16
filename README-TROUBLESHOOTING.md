# Troubleshooting - App Dieta Fácil

## Erro: "Cannot read properties of undefined (reading 'createContext')"

### Problema
Erro que ocorria no arquivo `vendor-other-BqKtWlTU.js` relacionado ao `createContext` ser undefined.

### Causa Raiz (Atualizada)
O problema tinha **duas causas principais**:

1. **Configuração inadequada do Vite**: Dividindo o React em chunks separados
2. **Conflito entre bibliotecas de tema**: 
   - O projeto usava tanto `next-themes` quanto uma implementação customizada de tema
   - Isso causava conflitos no `createContext` onde `next-themes` esperava que `React` estivesse disponível globalmente
   - No código minificado aparecia como `q.createContext(void 0)` onde `q` era undefined

### Solução Implementada (Completa)
1. **Modificação do `vite.config.ts`:**
   - Agrupamos todos os pacotes relacionados ao React (`react`, `react-dom`, `react-router`, `react-hook-form`, `react-i18next`) no mesmo chunk `vendor-react`
   - Adicionamos aliases no `resolve` para garantir que apenas uma instância do React seja usada
   - Configuramos `optimizeDeps` com `force: true` para forçar o pre-bundling

3. **Remoção do conflito de temas**:
   - Removemos a dependência `next-themes` do `package.json`
   - Atualizamos `sonner.tsx` para usar nossa implementação customizada (`useTheme`)
   - Eliminamos a duplicação de Context providers de tema

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

4. **Aliases para React:**
   ```typescript
   resolve: {
     alias: {
       "@": path.resolve(__dirname, "./src"),
       "react": path.resolve(__dirname, "node_modules/react"),
       "react-dom": path.resolve(__dirname, "node_modules/react-dom"),
     },
   }
   ```

5. **Unificação da Lógica de Temas:**
   - Removida a implementação customizada de temas
   - Mantido apenas o `next-themes` para gerenciamento de temas
   - Garantido que `next-themes` esteja configurado corretamente para evitar conflitos

### Prevenção
- **NUNCA** separe pacotes relacionados ao React em chunks diferentes
- Sempre mantenha `react`, `react-dom` e bibliotecas que dependem de contextos do React no mesmo chunk
- Use aliases para garantir que apenas uma instância do React seja carregada
- **EVITE** usar múltiplas bibliotecas de tema simultaneamente (ex: `next-themes` + implementação customizada)
- Prefira uma única implementação consistente de gerenciamento de tema

### Sinais de Problema Similar
Se você ver no código minificado algo como:
```javascript
qw = q.createContext(void 0)  // q é undefined
// ou
someVar.createContext(...)    // someVar é undefined
```
Isso indica conflito entre bibliotecas ou problemas de bundling do React.

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
- `package.json` - Remoção da dependência `next-themes`
- `src/components/ui/sonner.tsx` - Atualização para usar tema customizado
