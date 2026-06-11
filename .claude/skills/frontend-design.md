# Frontend Design — Canelada

> Identidade visual e regras anti AI-aesthetics para o Canelada.
> Leia este arquivo antes de implementar qualquer tela ou componente.

---

## Identidade Visual

O Canelada é um app de futebol amador para grupos que se conhecem. O visual
deve parecer **construído por alguém com bom gosto**, não gerado por IA.

**Vibe:** dark, denso, de grupo fechado. Como um placar de bar que foi bem feito.
**Não é:** SaaS, productivity app, dashboard corporativo, landing page de startup.

---

## Paleta obrigatória

Tokens definidos em `src/app/globals.css` e documentados em `CLAUDE.md`.

| Token | Valor | Uso |
|---|---|---|
| `--green` | `#9fe870` | CTA principal, destaque, MVP badge |
| `--green-deep` | `#163300` | Texto sobre verde |
| `--ink` | `#0e0f0c` | Card dark primário |
| `#0a0a0a` | page bg | Fundo do html/body |
| `#141414` | card secundário | Segundo nível de superfície |
| `rgba(255,255,255,0.45)` | texto secundário | Corpo de texto em superfície dark |
| `rgba(255,255,255,0.06)` | borda sutil | Divisores e bordas em dark |

**Regra:** nunca use branco puro (`#fff`) como cor de texto principal em superfícies dark.
Use `rgba(255,255,255,0.87)` para texto primário e `rgba(255,255,255,0.45)` para secundário.

---

## Tipografia

- **Corpo:** Inter, sempre. Sem fallback para Roboto, Arial ou system-ui.
- **Display / Logo:** Barlow Condensed 900 — somente para o nome CANELADA e números grandes de estatística.
- `font-feature-settings: "calt"` aplicado globalmente.
- `-webkit-font-smoothing: antialiased` no html.

---

## Ícones

**Biblioteca:** Lucide React (`lucide-react`).
- `strokeWidth={1.5}` é o padrão — não use 2 (parece grosseiro) nem 1 (parece fraco).
- Nunca misture estilos: todos os ícones da mesma tela devem ter o mesmo `strokeWidth`.
- Tamanhos recomendados: 16px (inline), 20px (botão), 24px (header), 28px (destaque).

---

## Anti-padrões — nunca faça

### Cores proibidas
- Gradientes roxo/azul em background (AI aesthetic clássico)
- `bg-gradient-to-br from-purple-500 to-blue-600` ou variações
- Glassmorphism genérico sem propósito
- Cores neon saturadas além do `--green` definido no design system

### Layout proibido
- Cards com `border: 1px solid #e5e7eb` (cinza genérico de Tailwind)
- Grids de 3 colunas com cards idênticos em tamanho
- Seções com padding simétrico que parecem templates
- Bottom nav com labels de texto longos — apenas ícone + label curto

### Tipografia proibida
- `text-4xl font-bold` sem propósito hierárquico claro
- Textos em uppercase para corpo de texto
- `letter-spacing: 0.1em` em textos longos
- Mix de pesos sem intenção

### Componentes proibidos
- Botões com `border-radius: 4px` ou `0` — mínimo `--r-md` (12px)
- Inputs com fundo branco em superfície dark
- Avatares quadrados — sempre circulares
- Badges com fundo `#e5e7eb`

### Animações proibidas
- `transition: all` — especifique exatamente o que anima
- Hover com `transform: scale(1.05)` em cards grandes
- Animações de entrada em cada scroll
- `animation-duration > 400ms` para interações de UI

---

## Padrões obrigatórios

### Hierarquia de superfícies dark
```
#0a0a0a  → page background (html/body)
#0e0f0c  → card primário (var(--ink))
#141414  → card secundário / hover state
rgba(255,255,255,0.04) → hover sutil
```

### Bordas em dark
```css
border: 1px solid rgba(255,255,255,0.06); /* sutil */
border: 1px solid rgba(255,255,255,0.10); /* destaque */
```

### Botão CTA
```css
background: var(--green);
color: var(--green-deep);
border-radius: var(--r-xl); /* 20px */
min-height: 52px;
font-weight: 800;
```

### Mobile-first
- Layout máximo: `max-width: 390px` centrado
- `padding: 0 16px` nas laterais
- `padding-bottom: 80px` no main para bottom nav
- Touch targets: `min-height: 44px`
- CTA principal: `min-height: 52px`
- Use `min-height: 100dvh` — nunca `100vh`

---

## Referências

- Tokens completos: `CLAUDE.md`
- Primitivos e semânticos: `.claude/docs/design.md`
- Telas do MVP: `.claude/docs/product-spec.md`
- Figma: https://www.figma.com/design/cyuao5ahsV5DB07kaiFfPW
