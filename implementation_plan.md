# Otimização Mobile — Curumim Copiloto IA

O app usa um layout de sidebar fixa (256px) com conteúdo em `ml-64`. No celular, isso significa que o conteúdo fica completamente escondido atrás da sidebar. A solução é implementar um padrão de navegação mobile moderno: **bottom navigation bar** + **sidebar como drawer (overlay)**.

## Mudanças Propostas

### Layout Principal

#### [MODIFY] [index.tsx](file:///c:/Users/Usuario/OneDrive/Desktop/copiloto%20-%20projetos/curumim/index.tsx)
- Adicionar estado `isMobileMenuOpen` para controlar o drawer da sidebar
- Em mobile (`< md`): remover `ml-64` do `<main>`, usar `ml-0` 
- Adicionar `<BottomNav>` inline para mobile (para não criar arquivo novo)
- Passar `isOpen`, `onClose` para a Sidebar

---

### Sidebar como Drawer Mobile

#### [MODIFY] [Sidebar.tsx](file:///c:/Users/Usuario/OneDrive/Desktop/copiloto%20-%20projetos/curumim/components/Sidebar.tsx)
- Adicionar prop `isOpen` e `onClose`
- Em mobile: sidebar vira overlay drawer com backdrop semitransparente
- Em desktop (≥ md): comportamento padrão mantido (fixa)
- Adição de botão "X" para fechar em mobile

---

### ChatView — Tela dividida → navegação mobile

#### [MODIFY] [ChatView.tsx](file:///c:/Users/Usuario/OneDrive/Desktop/copiloto%20-%20projetos/curumim/components/ChatView.tsx)
- Problema: layout de 2 painéis (`w-[340px]` + `flex-1`) não funciona em celular
- Solução: em mobile, mostrar apenas **um painel por vez**
  - Painel esquerdo (lista de conversas) quando nenhuma selecionada
  - Painel direito (mensagens) quando conversa selecionada, com botão "Voltar"
- Estado `mobileView: 'list' | 'chat'` para controlar qual painel mostrar

---

### HomeView — ajustes de padding e layout

#### [MODIFY] [HomeView.tsx](file:///c:/Users/Usuario/OneDrive/Desktop/copiloto%20-%20projetos/curumim/components/HomeView.tsx)
- Reduzir padding no hero: `px-6 py-8` → `px-4 py-6` em mobile
- O relógio em `flex-col md:flex-row` já está responsivo, mas pode estar cortado
- Grid de KPIs `grid-cols-2 lg:grid-cols-4` já está OK
- Adicionar `pb-20` no container principal para não sobrepor com bottom nav

---

### Outros componentes — padding bottom para bottom nav

- **Todos os views** precisam de `pb-20 md:pb-0` para não ter conteúdo oculto sob a bottom nav em mobile
- Especialmente: `CalendarView`, `KanbanBoard`, `ClientesView`, [ChatView](file:///c:/Users/Usuario/OneDrive/Desktop/copiloto%20-%20projetos/curumim/components/ChatView.tsx#330-602), `MassBroadcastView`, `ReportsView`

---

## CSS Global (index.html)

- A meta viewport já está correta: `width=device-width, initial-scale=1.0` ✅
- Adicionar `touch-action: manipulation` no body para remover delay de 300ms no toque
- Garantir `min-height: 100dvh` para mobile (dynamic viewport height — resolve problema de barra de endereço do navegador)

---

## Verificação

### Manual (no navegador desktop — DevTools)
1. Abrir o app (`npm run dev`, acessar `localhost:5173`)
2. Abrir DevTools → Ativar "Device Toolbar" (Ctrl+Shift+M)
3. Selecionar iPhone 12 Pro (390x844)
4. Verificar:
   - Sidebar não aparece sobreposta ao conteúdo ✅
   - Bottom nav aparece na base da tela ✅
   - Clicar ícone hamburger abre a sidebar como drawer ✅
   - Na tela de Chat: lista de conversas aparece, ao clicar abre as mensagens ✅
   - Ao tocar "Voltar" no chat, retorna à lista ✅
   - Conteúdo não fica escondido atrás da bottom nav ✅
