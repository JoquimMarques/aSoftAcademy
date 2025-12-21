# Sistema de Certificados - Configuração

## 📋 Dependências Necessárias

Para o sistema de certificados funcionar completamente (incluindo download em PDF), você precisa instalar as seguintes dependências:

```bash
npm install html2canvas jspdf
```

## 🎯 Funcionalidades Implementadas

### ✅ Sistema Completo de Certificados

1. **Geração Automática de Certificados**
   - Quando um aluno completa 100% de um curso, um certificado é gerado automaticamente
   - Os certificados são armazenados no Firestore na coleção `certificates`

2. **Visualização de Certificados**
   - Página `/certificados` lista todos os certificados do usuário
   - Cada certificado pode ser visualizado em tela cheia
   - Design baseado na imagem `Certificado.png` fornecida

3. **Download em PDF**
   - Botão para baixar o certificado como PDF
   - Requer as bibliotecas `html2canvas` e `jspdf`

## 📁 Arquivos Criados/Modificados

### Novos Arquivos:
- `src/services/certificateService.js` - Serviço para gerenciar certificados
- `src/components/CertificateView.jsx` - Componente para exibir certificado
- `src/components/CertificateView.css` - Estilos do certificado

### Arquivos Modificados:
- `src/pages/Certificados.jsx` - Atualizado para buscar e exibir certificados do Firestore
- `src/pages/CoursePlayer.jsx` - Adicionada lógica para gerar certificado automaticamente

## 🔧 Como Funciona

1. **Quando um curso é concluído:**
   - O sistema verifica se o progresso chegou a 100%
   - Verifica se todos os vídeos foram concluídos
   - Gera automaticamente um certificado no Firestore

2. **Estrutura do Certificado no Firestore:**
   ```javascript
   {
     id: "userId_courseId",
     userId: "user123",
     courseId: "excel-basico",
     courseTitle: "Excel Básico",
     courseDuration: "25 horas",
     studentName: "Nome do Aluno",
     studentEmail: "email@example.com",
     issuedAt: "2025-01-15T10:30:00Z",
     issuedDate: "15 Janeiro, 2025",
     verificationCode: "BRC-ABC12345",
     // ... outros campos
   }
   ```

3. **Visualização:**
   - O certificado é renderizado dinamicamente com todas as informações
   - Inclui nome do aluno, curso, data de conclusão, duração do curso
   - Design responsivo e profissional

## 🎨 Design do Certificado

O certificado segue o design da imagem base fornecida:
- **Painel Esquerdo:** Verde escuro com logo e data
- **Painel Direito:** Verde claro com informações do certificado
- **Elementos:** Nome do aluno, descrição do curso, assinatura, selo decorativo

## 📝 Próximos Passos

1. Instalar as dependências: `npm install html2canvas jspdf`
2. Testar a geração de certificados completando um curso
3. Verificar se os certificados aparecem na página `/certificados`
4. Testar o download em PDF

## ⚠️ Notas Importantes

- Os certificados são gerados automaticamente quando um curso é 100% concluído
- Cada usuário pode ter apenas um certificado por curso
- Os certificados incluem código de verificação único
- A duração do curso é exibida no certificado

