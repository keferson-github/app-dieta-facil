import React from 'react';
import { 
    useTestContext
 } from './test-context-provider';

export const TestComponent: React.FC = () => {
  const { value, setValue } = useTestContext();
  
  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: '#e6f7ff', 
      border: '1px solid #91d5ff',
      borderRadius: '4px',
      margin: '10px'
    }}>
      <h2>✅ Teste de Context</h2>
      <p><strong>Status:</strong> {value}</p>
      <p><em>Se você está vendo esta mensagem, o createContext está funcionando corretamente!</em></p>
      
      <div style={{ marginTop: '15px' }}>
        <button 
          onClick={() => setValue('Context atualizado via setState! 🚀')}
          style={{
            padding: '8px 16px',
            backgroundColor: '#1890ff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Testar setState
        </button>
        
        <button 
          onClick={() => setValue('Context funcionando perfeitamente! ✅')}
          style={{
            padding: '8px 16px',
            backgroundColor: '#52c41a',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginLeft: '10px'
          }}
        >
          Resetar
        </button>
      </div>
    </div>
  );
};
