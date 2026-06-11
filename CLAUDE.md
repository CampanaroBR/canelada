# Canelada — Design System Rules

> Regras para implementação de designs Figma na Canelada App.
> Figma file: https://www.figma.com/design/cyuao5ahsV5DB07kaiFfPW

---

## Figma MCP Integration — Fluxo Obrigatório

Antes de implementar qualquer componente ou tela do Figma, siga esta sequência:

1. `get_design_context` no nó específico para obter estrutura e tokens
2. `get_screenshot` para referência visual exata
3. Implementar traduzindo para os padrões deste projeto (tokens, componentes, convenções)
4. Validar visualmente contra o screenshot do Figma antes de finalizar

---

## Design Tokens — CSS Variables

Todos os tokens estão definidos como CSS custom properties. **Nunca hardcode valores hex ou px.**

### Cores

```css
:root {
  /* Brand / Green */
  --green: #9fe870;
  --green-pale: #e2f6d5;
  --green-mid: #c5edab;
  --green-deep: #163300;

  /* Blue */
  --blue: #2563EB;
  --blue-pale: #dbeafe;
  --blue-deep: #1e3a8a;

  /* Orange */
  --orange: #f97316;
  --orange-pale: #fed7aa;
  --orange-deep: #7c2d12;

  /* Danger / Red */
  --danger: #dc2626;
  --danger-pale: #fee2e2;
  --danger-deep: #7f1d1d;

  /* Ink — Neutral dark */
  --ink: #0e0f0c;
  --ink2: #454745;
  --ink3: #868685;
  --ink4: #c8ccc5;

  /* Surface */
  --bg: #e8ebe6;
  --card: #ffffff;
  --subtle: #f4f6f1;
  --subtle2: #eef0eb;

  /* Borders */
  --brd: rgba(14,15,12,0.07);
  --brd2: rgba(14,15,12,0.14);
}
```

### Sombras

```css
:root {
  --s1: 0 1px 4px rgba(14,15,12,0.06), 0 1px 2px rgba(14,15,12,0.04);
  --s2: 0 4px 16px rgba(14,15,12,0.08), 0 2px 4px rgba(14,15,12,0.04);
  --s3: 0 8px 28px rgba(14,15,12,0.12), 0 4px 8px rgba(14,15,12,0.06);
}
```

### Border Radius

```css
:root {
  --r-sm: 8px;
  --r-md: 12px;
  --r-lg: 16px;
  --r-xl: 20px;
  --r-2xl: 24px;
  --r-pill: 9999px;
}
```

---

## Tipografia

**Família:** Inter (Google Fonts)

| Estilo | Size | Weight | Uso |
|---|---|---|---|
| Display 1 | 56px | 900 | Rating números grandes |
| H1 | 24px | 800 | Logo, títulos de seção |
| Body MD | 13px | 400/500 | Subtítulos, meta-texto |
| Label MD | 13px | 700 | Botões, labels |
| Label XS | 10px | 700 | Eyebrow text, tags pill |

---

## Ícones

**Biblioteca:** Phosphor Icons (via @phosphor-icons/react)

**IMPORTANTE:** Não instale outras bibliotecas de ícones.

---

## Convenções de Código

### Organização de componentes
```
src/
  components/
    ui/              # Componentes genéricos
    feed/            # Componentes do Feed
    layout/          # Header, BottomNav, Screen
  styles/
    tokens.css       # CSS custom properties
    base.css         # Reset + body styles
  assets/
    icons/           # SVGs exportados do Figma
```

### Variáveis CSS
- SEMPRE use `var(--token)` — nunca hardcode valores
