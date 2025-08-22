# 📅 Agenda Semanal - Organizador de Compromissos

Site minimalista e retro para organizar compromissos semanais com sistema de senhas.

## 🚀 Deploy Rápido

### Netlify:
1. Faça upload do arquivo ZIP no Netlify
2. O site estará online automaticamente

### GitHub Pages:
1. Crie um repositório no GitHub
2. Faça upload dos arquivos
3. Ative GitHub Pages nas configurações

## 📁 Arquivos Inclusos

- `index.html` - Página principal
- `style.css` - Estilos retro/nostálgicos
- `script.js` - Funcionalidades e sistema de senhas
- `README.md` - Este arquivo de instruções

## 🔐 Senhas Padrão

- **Administrador**: `admin123` (pode adicionar/remover compromissos)
- **Visualização**: `view123` (apenas visualizar horários)

## ⚙️ Personalização

Para alterar senhas e configurações, edite o arquivo `script.js` na seção CONFIG:

```javascript
const CONFIG = {
    ADMIN_PASSWORD: 'admin123',    // ← Sua senha de admin
    VIEW_PASSWORD: 'view123',      // ← Sua senha de visualização
    WORKING_HOURS: {
        start: '08:00',            // ← Horário de início
        end: '18:00'               // ← Horário de término
    },
    TIME_INTERVAL: 30,             // ← Intervalos em minutos
    WORKING_DAYS: {               // ← Dias que funcionam
        segunda: true,
        terca: true,
        quarta: true,
        quinta: true,
        sexta: true,
        sabado: false,             // ← Desabilitado
        domingo: false             // ← Desabilitado
    }
};
```

## 🎨 Funcionalidades

- ✅ Design minimalista e nostálgico
- ✅ Sistema de senhas para controle de acesso
- ✅ Horários com início e fim
- ✅ Visualização de horários disponíveis/ocupados
- ✅ Responsivo para mobile
- ✅ Animações suaves
- ✅ Fácil personalização no código

## 🌐 Como Usar

1. Abra o site
2. Clique no botão "🔐 Fazer Login"
3. Digite uma das senhas
4. Use as funcionalidades conforme seu nível de acesso

---

**Desenvolvido com HTML, CSS e JavaScript puro - sem dependências externas!**
