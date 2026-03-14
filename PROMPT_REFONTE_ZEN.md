# PROMPT — Refonte Design "White & Playful" v2 (corrigé)

> **Mode d'emploi** : Copiez-collez ce prompt dans Claude Chat en joignant votre fichier `index.html` en pièce jointe.

---

```
Tu es un designer/développeur senior spécialisé UX moderne et minimaliste. Tu dois transformer le design de cette application Scalyo pour créer une expérience ultra-épurée, lumineuse et colorée — inspirée des portfolios design modernes (fond blanc immaculé, typographie colorée multicolore, espacement très aéré, ombres quasi-invisibles).

Tu dois aussi :
1. T'assurer que le KANBAN est bien accessible et fonctionnel (bouton visible dans le sidebar, navigation qui fonctionne)
2. Rendre le SIDEBAR SCROLLABLE — le menu de gauche monte et descend avec la souris (logo en haut et avatar/settings en bas restent FIXES, seuls les items de navigation au milieu scrollent)

La landing page (LoginScreen) et l'application doivent partager la MÊME direction artistique.

═══════════════════════════════════════════════════════
RÈGLES NON NÉGOCIABLES
═══════════════════════════════════════════════════════

- Retourne le fichier COMPLET à la fin
- NE MODIFIE AUCUNE logique métier, aucune fonction, aucun appel Supabase/Stripe/Anthropic
- NE SUPPRIME aucun composant ou fonctionnalité
- NE CHANGE PAS les noms de variables JS, fonctions, composants React
- Tu modifies UNIQUEMENT : les couleurs, ombres, gradients, animations, polices, bordures, arrondis, opacités, ET la structure du sidebar (scrollable) et la vérification du Kanban
- Chaque modification doit être cohérente entre mode DARK et mode LIGHT
- Le résultat doit être accessible (contraste WCAG AA)

═══════════════════════════════════════════════════════
⚠️ PARTIE 0 — RECHERCHER-REMPLACER GLOBAL (CRITIQUE)
═══════════════════════════════════════════════════════

AVANT de toucher quoi que ce soit d'autre, exécute ces remplacements MÉCANIQUES dans TOUT le fichier.
Chaque remplacement est listé avec son nombre exact d'occurrences pour que tu puisses vérifier.

### 0.1 — TEXTE DES BOUTONS (le plus critique — cause d'illisibilité)

⚠️ `color: "#070D1A"` apparaît **24 fois** dans le fichier. C'était l'ancienne couleur de fond sombre utilisée comme couleur de texte sur les boutons à gradient.
Maintenant que le fond est blanc, ce texte quasi-noir sur un bouton à gradient clair est ILLISIBLE.

**REMPLACE** : `color: "#070D1A"` → `color: "#FFFFFF"`
**PARTOUT** — les 24 occurrences. Ce sont tous des textes de boutons sur fond gradient ou sombre.
Vérifie qu'il ne reste AUCUN `#070D1A` dans le fichier après ce remplacement.

Aussi : si un `Spinner` a `color: "#070D1A"`, remplace par `color: "#FFFFFF"`.

### 0.2 — FOND BODY CSS (ligne ~20)

REMPLACE la ligne CSS :
```
html,body,#root{height:100%;background:#070D1A;font-family:'DM Sans',sans-serif;color:#E8EDF5;...}
```
PAR :
```
html,body,#root{height:100%;background:#FFFFFF;font-family:'Inter',sans-serif;color:#111111;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}
```

### 0.3 — BLEU NÉON HARDCODÉ (~22 occurrences de #0EA5E9)

**REMPLACE** dans les template literals (backtick strings) :
`#0EA5E9` → `${C.blue}`

**REMPLACE** dans les strings normales (guillemets) :
`#0EA5E9` → la valeur C.blue du mode actif, soit utilise `${C.blue}` si possible.

Le but : AUCUN `#0EA5E9` ne doit rester dans le fichier.

### 0.4 — TEAL NÉON DANS LE CSS (~18 occurrences de rgba(18,205,184,...))

Dans la section `<style>` CSS UNIQUEMENT, remplace :
- `rgba(18,205,184,` → `rgba(16,185,129,` (PARTOUT dans le CSS)
- `#12CDB8` → `#10B981` (PARTOUT dans le CSS)

### 0.5 — SURFACES ET BORDURES CSS (fond blanc = rgba noir, pas rgba blanc)

Dans la section `<style>` CSS UNIQUEMENT, remplace :
- `rgba(255,255,255,0.03)` → `rgba(0,0,0,0.02)` (tab-bar bg)
- `rgba(255,255,255,0.04)` → `rgba(0,0,0,0.02)` (surfaces, chips, tips, skeleton)
- `rgba(255,255,255,0.05)` → `rgba(0,0,0,0.03)` (chat-input bg, nav hover, quick-chip)
- `rgba(255,255,255,0.06)` → `rgba(0,0,0,0.04)` (btn-secondary bg)
- `rgba(255,255,255,0.08)` → `rgba(0,0,0,0.06)` (borders, tip-card)
- `rgba(255,255,255,0.09)` → `rgba(0,0,0,0.08)` (scrollbar)
- `rgba(255,255,255,0.1)` → `rgba(0,0,0,0.08)` (borders, chips, toggle, input border)
- `rgba(255,255,255,0.18)` → `rgba(0,0,0,0.14)` (scrollbar hover, btn-secondary hover)
- `rgba(232,237,245,0.5)` → `rgba(0,0,0,0.40)` (tab-item text muted)
- `rgba(232,237,245,0.7)` → `rgba(0,0,0,0.50)` (chip text)
- `rgba(232,237,245,0.75)` → `rgba(0,0,0,0.55)` (quick-chip text)
- `rgba(232,237,245,0.85)` → `rgba(0,0,0,0.70)` (btn-secondary text)

### 0.6 — MODALS/TABS CSS

- `background:#0C1525` → `background:#FFFFFF` (modal-box)
- `background:#131E35` → `background:#FFFFFF` (tab-item.active)
- `color:#E8EDF5` → `color:#111111` (tab-item.active text, body text)
- `rgba(7,13,26,0.9)` → `rgba(0,0,0,0.40)` (modal overlay)
- `rgba(0,0,0,0.3)` → `rgba(0,0,0,0.06)` (tab shadow)
- `rgba(0,0,0,0.25)` → `rgba(0,0,0,0.12)` (toggle shadow)

### 0.7 — DANGER CSS

- `rgba(240,76,91,0.1)` → `rgba(239,68,68,0.06)` (btn-danger bg)
- `#F04C5B` → `#EF4444` (btn-danger text)
- `rgba(240,76,91,0.2)` → `rgba(239,68,68,0.16)` (btn-danger border)
- `rgba(240,76,91,0.18)` → `rgba(239,68,68,0.12)` (btn-danger hover)

### 0.8 — POLICES

- `'DM Sans'` → `'Inter'` (partout dans le fichier — CSS + JS)
- `'DM Mono'` → `'JetBrains Mono'` (partout dans le fichier)
- Remplacer le `<link>` Google Fonts (ligne ~9) par :
  `<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet"/>`

### 0.9 — TOGGLE SWITCH CSS

- `rgba(255,255,255,0.1)` → `rgba(0,0,0,0.10)` (slider background)
- `linear-gradient(135deg,#12CDB8,#0EA5E9)` → `#10B981` (checked state — couleur solide, pas gradient)

### 0.10 — VÉRIFICATION APRÈS REMPLACEMENTS

Après tous ces remplacements, fais un CTRL+F dans le fichier pour vérifier :
□ `#070D1A` → 0 occurrence (ZÉRO restant)
□ `#0EA5E9` → 0 occurrence
□ `#12CDB8` → 0 occurrence dans le CSS (peut rester dans les tokens JS C_DARK si besoin)
□ `#0C1525` → 0 occurrence
□ `#131E35` → 0 occurrence
□ `#E8EDF5` → 0 occurrence dans le CSS (reste dans les tokens JS C_DARK)
□ `#F04C5B` → 0 occurrence dans le CSS
□ `DM Sans` → 0 occurrence
□ `DM Mono` → 0 occurrence

═══════════════════════════════════════════════════════
PARTIE 1 — PHILOSOPHIE DESIGN "WHITE & PLAYFUL"
═══════════════════════════════════════════════════════

L'objectif est de créer un environnement visuel qui évoque :
- Un portfolio design moderne (fond blanc pur, beaucoup d'espace)
- Des accents multicolores joyeux (comme un "Welcome" écrit en plusieurs couleurs)
- La simplicité d'Apple / Linear / Notion
- Un produit SaaS premium, clean, pas un outil de développeur sombre

Principes :
1. FOND BLANC PUR — #FFFFFF, pas de gris, pas de crème, BLANC
2. ACCENTS MULTICOLORES — Vert émeraude, violet, orange, bleu
3. TYPOGRAPHIE NETTE — Police Inter, titres en noir #111, sous-titres en gris #666
4. OMBRES QUASI-INVISIBLES — box-shadow très légères rgba(0,0,0,0.04 à 0.08)
5. ARRONDIS GÉNÉREUX — 14px à 24px
6. ESPACEMENT AÉRÉ — Padding généreux, gap 16-24px
7. TRANSITIONS DOUCES — 0.3s ease
8. ZÉRO NÉON — Aucun #12CDB8, #0EA5E9, couleurs vives mais naturelles

═══════════════════════════════════════════════════════
PARTIE 2 — NOUVELLE PALETTE DE COULEURS
═══════════════════════════════════════════════════════

### Mode Clair (C_LIGHT) — THÈME PRINCIPAL PAR DÉFAUT

Remplace l'objet C_LIGHT existant par :

```js
const C_LIGHT = {
  bg: "#FFFFFF",
  bg1: "#FFFFFF",
  bg2: "#F7F7F8",
  bg3: "#F0F0F2",
  surface: "rgba(0,0,0,0.02)",
  surfaceHi: "rgba(0,0,0,0.04)",
  border: "rgba(0,0,0,0.08)",
  borderHi: "rgba(0,0,0,0.14)",
  teal: "#10B981",
  tealBg: "rgba(16,185,129,0.06)",
  tealBorder: "rgba(16,185,129,0.20)",
  tealGlow: "rgba(16,185,129,0.08)",
  red: "#EF4444",
  redBg: "rgba(239,68,68,0.06)",
  redBorder: "rgba(239,68,68,0.18)",
  amber: "#F59E0B",
  amberBg: "rgba(245,158,11,0.06)",
  amberBorder: "rgba(245,158,11,0.18)",
  green: "#10B981",
  greenBg: "rgba(16,185,129,0.06)",
  greenBorder: "rgba(16,185,129,0.18)",
  purple: "#8B5CF6",
  purpleBg: "rgba(139,92,246,0.06)",
  blue: "#3B82F6",
  blueBg: "rgba(59,130,246,0.06)",
  text: "#111111",
  muted: "rgba(0,0,0,0.45)",
  faint: "rgba(0,0,0,0.10)"
};
```

### Mode Sombre (C / C_DARK) — Thème nuit neutre

Remplace l'objet C existant (le premier, celui qui sert de dark) par :

```js
const C = {
  bg: "#0F0F0F",
  bg1: "#1A1A1A",
  bg2: "#222222",
  bg3: "#2A2A2A",
  surface: "rgba(255,255,255,0.04)",
  surfaceHi: "rgba(255,255,255,0.07)",
  border: "rgba(255,255,255,0.08)",
  borderHi: "rgba(255,255,255,0.15)",
  teal: "#34D399",
  tealBg: "rgba(52,211,153,0.08)",
  tealBorder: "rgba(52,211,153,0.22)",
  tealGlow: "rgba(52,211,153,0.10)",
  red: "#F87171",
  redBg: "rgba(248,113,113,0.08)",
  redBorder: "rgba(248,113,113,0.18)",
  amber: "#FBBF24",
  amberBg: "rgba(251,191,36,0.08)",
  amberBorder: "rgba(251,191,36,0.20)",
  green: "#34D399",
  greenBg: "rgba(52,211,153,0.08)",
  greenBorder: "rgba(52,211,153,0.20)",
  purple: "#A78BFA",
  purpleBg: "rgba(167,139,250,0.08)",
  blue: "#60A5FA",
  blueBg: "rgba(96,165,250,0.07)",
  text: "#F5F5F5",
  muted: "rgba(245,245,245,0.50)",
  faint: "rgba(245,245,245,0.15)"
};
```

Ensuite `const C_DARK = Object.assign({},C);` reste inchangé.

═══════════════════════════════════════════════════════
PARTIE 3 — CSS COMPLET (remplace TOUT le <style>)
═══════════════════════════════════════════════════════

Remplace TOUT le contenu de la balise `<style>` (lignes ~18 à ~85) par ceci :

```css
*{box-sizing:border-box;margin:0;padding:0}
html,body,#root{height:100%;background:#FFFFFF;font-family:'Inter',sans-serif;color:#111111;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}
::-webkit-scrollbar{width:4px;height:4px}
::-webkit-scrollbar-track{background:transparent}
::-webkit-scrollbar-thumb{background:rgba(0,0,0,0.10);border-radius:4px}
::-webkit-scrollbar-thumb:hover{background:rgba(0,0,0,0.20)}
.btn{display:inline-flex;align-items:center;gap:6px;padding:10px 20px;border-radius:12px;font-size:13px;font-weight:600;border:none;cursor:pointer;transition:all .3s ease;letter-spacing:-.2px}
.btn-primary{background:#111111;color:#fff;box-shadow:0 2px 8px rgba(0,0,0,0.08)}
.btn-primary:hover{transform:translateY(-0.5px);box-shadow:0 4px 16px rgba(0,0,0,0.12)}
.btn-secondary{background:rgba(0,0,0,0.04);color:rgba(0,0,0,0.7);border:1px solid rgba(0,0,0,0.08)}
.btn-secondary:hover{background:rgba(0,0,0,0.07);border-color:rgba(0,0,0,0.14)}
.btn-danger{background:rgba(239,68,68,0.06);color:#EF4444;border:1px solid rgba(239,68,68,0.16)}
.btn-danger:hover{background:rgba(239,68,68,0.12)}
.btn-sm{padding:6px 14px;font-size:12px;border-radius:10px}
.csm-filter-bar{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px;align-items:center;padding:0 2px}
.csm-chip{padding:6px 16px;border-radius:20px;font-size:12px;font-weight:600;cursor:pointer;border:1px solid rgba(0,0,0,0.08);background:rgba(0,0,0,0.02);color:rgba(0,0,0,0.5);transition:all .25s ease}
.csm-chip:hover{background:rgba(16,185,129,0.06);border-color:rgba(16,185,129,0.20);color:#10B981}
.csm-chip.active{background:rgba(16,185,129,0.08);border-color:rgba(16,185,129,0.30);color:#10B981;font-weight:700}
.chat-input{flex:1;background:rgba(0,0,0,0.02);border:1px solid rgba(0,0,0,0.08);border-radius:14px;padding:12px 16px;color:#111;font-size:13px;font-family:inherit;resize:none}
.chat-input:focus{outline:none;border-color:rgba(16,185,129,0.40);background:#fff}
.chat-send-btn{background:#111;border:none;border-radius:14px;width:44px;height:44px;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:17px;box-shadow:0 2px 8px rgba(0,0,0,0.08);transition:all .3s ease;flex-shrink:0}
.chat-send-btn:hover{transform:scale(1.03);box-shadow:0 4px 16px rgba(0,0,0,0.12)}
.chat-send-btn:disabled{opacity:.35;transform:none;cursor:not-allowed}
.api-banner{padding:14px 18px;background:rgba(245,158,11,0.05);border:1px solid rgba(245,158,11,0.16);border-radius:14px;margin:12px 18px;display:flex;gap:12px;font-size:13px;align-items:flex-start}
.tip-card{background:rgba(0,0,0,0.01);border:1px solid rgba(0,0,0,0.06);border-radius:16px;padding:16px 18px;margin-bottom:8px;cursor:pointer;transition:all .3s ease}
.tip-card:hover{background:rgba(16,185,129,0.03);border-color:rgba(16,185,129,0.16)}
.tip-card.open{border-color:rgba(16,185,129,0.24);background:rgba(16,185,129,0.03)}
.quick-chip{padding:7px 14px;border-radius:20px;font-size:12px;cursor:pointer;background:rgba(0,0,0,0.02);border:1px solid rgba(0,0,0,0.08);color:rgba(0,0,0,0.55);transition:all .25s ease;font-weight:500}
.quick-chip:hover{background:rgba(16,185,129,0.06);border-color:rgba(16,185,129,0.20);color:#10B981}
.toggle-switch{position:relative;width:46px;height:26px;display:inline-block;flex-shrink:0}
.toggle-switch input{display:none}
.toggle-slider{position:absolute;inset:0;border-radius:26px;background:rgba(0,0,0,0.10);cursor:pointer;transition:.3s}
.toggle-slider::before{content:"";position:absolute;width:20px;height:20px;left:3px;top:3px;background:#fff;border-radius:50%;transition:.3s;box-shadow:0 1px 4px rgba(0,0,0,0.12)}
input:checked+.toggle-slider{background:#10B981}
input:checked+.toggle-slider::before{transform:translateX(20px)}
.nav-btn{transition:all .25s ease;border-radius:12px;cursor:pointer}
.nav-btn:hover{background:rgba(0,0,0,0.04)!important}
.row-item{transition:background .2s ease;cursor:pointer}
.row-item:hover{background:rgba(0,0,0,0.02)!important}
.card-lift{transition:transform .3s ease,border-color .3s ease,box-shadow .3s ease}
.card-lift:hover{transform:translateY(-1px);border-color:rgba(0,0,0,0.12)!important;box-shadow:0 4px 16px rgba(0,0,0,0.06)}
.btn-base{transition:all .3s ease;cursor:pointer;border:none;font-family:'Inter',sans-serif;font-weight:600;outline:none}
.btn-base:hover:not(:disabled){transform:translateY(-0.5px);filter:brightness(1.04)}
.btn-base:active:not(:disabled){transform:translateY(0);filter:brightness(0.96)}
.btn-base:disabled{opacity:.35;cursor:not-allowed;transform:none!important;filter:none!important}
.fade-in{animation:fadeIn .4s ease forwards}
@keyframes fadeIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}
@keyframes slideInR{from{opacity:0;transform:translateX(12px)}to{opacity:1;transform:translateX(0)}}
@keyframes slideUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.6}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
.pulse{animation:pulse 2.5s infinite}
.spin{animation:spin .7s linear infinite}
input,select,textarea{outline:none;font-family:'Inter',sans-serif;-webkit-appearance:none;appearance:none}
input:focus,select:focus,textarea:focus{border-color:rgba(16,185,129,0.45)!important;box-shadow:0 0 0 3px rgba(16,185,129,0.08)!important}
.modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.40);backdrop-filter:blur(16px);z-index:300;display:flex;align-items:center;justify-content:center;padding:20px;animation:fadeIn .3s ease}
.modal-box{background:#FFFFFF;border:1px solid rgba(0,0,0,0.08);border-radius:24px;width:100%;animation:slideUp .35s ease;max-height:90vh;overflow-y:auto;box-shadow:0 24px 48px rgba(0,0,0,0.10)}
.side-panel{animation:slideInR .3s ease}
.tab-bar{display:flex;gap:4px;background:rgba(0,0,0,0.03);border-radius:14px;padding:4px}
.tab-item{padding:8px 18px;border-radius:10px;font-size:13px;font-weight:600;cursor:pointer;transition:all .25s ease;color:rgba(0,0,0,0.40);white-space:nowrap}
.tab-item.active{background:#FFFFFF;color:#111;box-shadow:0 1px 4px rgba(0,0,0,0.06)}
.tab-item:hover:not(.active){color:#111;background:rgba(0,0,0,0.03)}
.skeleton{background:linear-gradient(90deg,rgba(0,0,0,0.03) 25%,rgba(0,0,0,0.06) 50%,rgba(0,0,0,0.03) 75%);background-size:200% 100%;animation:shimmer 2s ease-in-out infinite;border-radius:10px}
nav::-webkit-scrollbar{width:3px}
nav::-webkit-scrollbar-track{background:transparent}
nav::-webkit-scrollbar-thumb{background:rgba(0,0,0,0.08);border-radius:3px}
nav::-webkit-scrollbar-thumb:hover{background:rgba(0,0,0,0.16)}
```

═══════════════════════════════════════════════════════
PARTIE 4 — GRADIENTS JS (dans le JavaScript, PAS le CSS)
═══════════════════════════════════════════════════════

### 4.1 — Gradient principal — TOUTES les occurrences
- `linear-gradient(135deg,#12CDB8,#0EA5E9)` → `linear-gradient(135deg,${C.teal},${C.blue})`
- `linear-gradient(135deg,${C.teal},#0EA5E9)` → `linear-gradient(135deg,${C.teal},${C.blue})`

### 4.2 — Gradient vert
- `linear-gradient(135deg,#10B981,#059669)` → `linear-gradient(135deg,${C.green},${C.teal})`

### 4.3 — Radial gradient LoginScreen
AVANT : `radial-gradient(ellipse 80% 55% at 50% -8%,rgba(18,205,184,0.13) 0%,transparent 62%)`
APRÈS : `radial-gradient(ellipse 80% 50% at 50% 0%,rgba(16,185,129,0.04) 0%,transparent 60%)`

═══════════════════════════════════════════════════════
PARTIE 5 — OMBRES ULTRA-LÉGÈRES (JS inline styles)
═══════════════════════════════════════════════════════

1. Logo : `0 10px 36px ${C.tealGlow}` → `0 4px 12px ${C.tealGlow}`
2. Logo LoginScreen : `0 4px 16px ${C.tealGlow}` → `0 2px 8px ${C.tealGlow}`
3. Form card LoginScreen : `0 48px 120px rgba(0,0,0,0.55)` → `0 4px 24px rgba(0,0,0,0.06)`
4. Sidebar : `1px 0 12px rgba(0,0,0,0.12)` → `1px 0 6px rgba(0,0,0,0.03)`
5. Card glow : `0 0 24px ${C.tealGlow}` → `0 0 12px ${C.tealGlow}`
6. HealthBar : `0 0 8px ${c}44` → `0 0 6px ${c}22`
7. Boutons inline : `0 6px 24px ${C.tealGlow}` → `0 2px 8px ${C.tealGlow}`
8. Bouton submit LoginScreen : `0 6px 24px ${C.tealGlow}` → `0 2px 8px rgba(0,0,0,0.10)`

═══════════════════════════════════════════════════════
PARTIE 6 — handleTheme
═══════════════════════════════════════════════════════

```js
const handleTheme = t => {
  try{localStorage.setItem("scalyo_theme",t);}catch(e){}
  Object.assign(C, t==="light"?C_LIGHT:C_DARK);
  document.body.style.background = t==="light"?"#FFFFFF":"#0F0F0F";
  document.body.style.color = t==="light"?"#111111":"#F5F5F5";
  document.getElementById("root").style.background = t==="light"?"#FFFFFF":"#0F0F0F";
  setTheme(t);
};
```

IMPORTANT :
- `useState("dark")` → `useState("light")` (thème par défaut = light)
- Si `localStorage.getItem("scalyo_theme")` retourne null → utilise "light"
- Le code `Object.assign(C, theme==="light" ? C_LIGHT : C_DARK);` au début de l'App doit rester.

═══════════════════════════════════════════════════════
PARTIE 7 — LANDING PAGE (LoginScreen)
═══════════════════════════════════════════════════════

La landing page DOIT être BELLE, LISIBLE et COHÉRENTE avec l'app.

### 7.1 — Fond
```js
background: `radial-gradient(ellipse 80% 50% at 50% 0%,rgba(16,185,129,0.04) 0%,transparent 60%),${C.bg}`
```
= Blanc pur + lueur verte quasi-invisible en haut

### 7.2 — Logo ⚡
```js
background: `linear-gradient(135deg,${C.teal},${C.blue})`,
borderRadius: 14,
boxShadow: `0 2px 8px ${C.tealGlow}`
```

### 7.3 — Titre "scalyo"
```js
color: C.text    // #111111 en light, #F5F5F5 en dark
```
Le "yo" en `C.teal` (vert émeraude en light, vert clair en dark).

### 7.4 — Form card
```js
background: C.bg1,       // blanc en light
border: `1px solid ${C.border}`,  // gris très subtil
borderRadius: 24,
boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
padding: 36
```

### 7.5 — Bouton submit
```js
background: `linear-gradient(135deg,${C.teal},${C.blue})`,
color: "#FFFFFF",        // ⚠️ BLANC, PAS #070D1A !!
borderRadius: 12,
boxShadow: "0 2px 8px rgba(0,0,0,0.10)",
fontSize: 15,
fontWeight: 700
```
⚠️ LE TEXTE DU BOUTON DOIT ÊTRE **BLANC** (#FFFFFF). Si tu vois `color: "#070D1A"` → remplace par `color: "#FFFFFF"`.

### 7.6 — Inputs
```js
background: C.surface,          // rgba(0,0,0,0.02) en light
border: `1px solid ${C.border}`, // rgba(0,0,0,0.08) en light
color: C.text,                   // #111111 en light
borderRadius: 12
```

### 7.7 — Labels
```js
color: C.muted,   // rgba(0,0,0,0.45) en light — LISIBLE sur blanc
fontSize: 11,
fontWeight: 700,
textTransform: "uppercase"
```

### 7.8 — Messages d'erreur
```js
background: C.redBg,
border: `1px solid ${C.redBorder}`,
color: C.red    // #EF4444 — rouge LISIBLE sur fond blanc
```

### 7.9 — Sélecteur de rôle (Manager/CSM)
```js
background: role === v ? C.tealBg : C.surface,
border: `1px solid ${role === v ? C.tealBorder : C.border}`,
color: role === v ? C.teal : C.muted
```

### 7.10 — Footer texte
```js
color: C.muted    // Gris moyen, lisible sur blanc
```

═══════════════════════════════════════════════════════
PARTIE 8 — SIDEBAR SCROLLABLE
═══════════════════════════════════════════════════════

Structure en 3 zones :

```
sidebar (flex column, height 100%, overflow: "hidden")
├── zone-haute (flexShrink: 0) → Logo ⚡ + "scalyo"
├── zone-milieu (flex: 1, overflowY: "auto", overflowX: "hidden") → <nav> items
└── zone-basse (flexShrink: 0, borderTop) → Settings + Avatar + Logout
```

VÉRIFIE que :
1. `<nav>` a `overflowY: "auto"` et `overflowX: "hidden"`
2. Container sidebar a `overflow: "hidden"`
3. Logo NE scrolle PAS
4. Settings/avatar NE scrollent PAS
5. Seuls les items nav scrollent avec la molette

═══════════════════════════════════════════════════════
PARTIE 9 — KANBAN FONCTIONNEL
═══════════════════════════════════════════════════════

VÉRIFIE ET CORRIGE :

### 9.1 — Navigation
- Item "Kanban" 📋 présent dans NAV_MANAGER et NAV_CSM
- Clic → setScreenPersist("kanban")
- renderView() → case "kanban" → KanbanView

### 9.2 — Boutons visibles
- Bouton "+" CLAIREMENT VISIBLE dans chaque colonne (fond C.tealBg, texte C.teal, border C.tealBorder)
- Formulaire : titre, description, priorité, date
- Bouton "Enregistrer" visible

### 9.3 — Style nouvelle DA
- Colonne "À faire" → C.blue
- Colonne "En cours" → C.amber
- Colonne "Terminé" → C.green
- Cartes : fond C.bg1, bordure C.border, border-radius 14px
- ⚠️ Texte des boutons dans le Kanban : vérifier qu'aucun n'a `color: "#070D1A"`

═══════════════════════════════════════════════════════
PARTIE 10 — VÉRIFICATION FINALE
═══════════════════════════════════════════════════════

### A. Zéro couleur morte
□ `#070D1A` → 0 occurrence dans TOUT le fichier
□ `#0EA5E9` → 0 occurrence dans TOUT le fichier
□ `#0C1525` → 0 occurrence
□ `#131E35` → 0 occurrence
□ `DM Sans` → 0 occurrence
□ `DM Mono` → 0 occurrence

### B. Lisibilité
□ TOUT texte sur fond blanc est en #111 ou C.muted (pas transparent, pas blanc)
□ TOUT texte sur bouton gradient est en #FFFFFF (blanc)
□ Labels des inputs : C.muted (gris moyen visible)
□ Placeholder : gris clair visible

### C. Landing page
□ Fond blanc pur
□ Titre "scalyo" LISIBLE (#111 + yo en vert)
□ Form card : ombre douce, bordure subtile
□ Bouton : gradient vert-bleu, texte BLANC
□ Inputs : bordures visibles, texte noir
□ Messages erreur : rouge lisible

### D. Sidebar
□ Nav scrolle avec la molette
□ Logo et avatar fixes

### E. Kanban
□ Accessible depuis le sidebar
□ Boutons "+" visibles
□ Cartes lisibles sur fond blanc

### F. Anti-régression
□ Login/Signup fonctionnels
□ Toutes les vues fonctionnelles
□ Thème switch fonctionne
□ I18N fr/en/kr intact
□ Aucun appel Supabase/Stripe/Anthropic modifié

### G. Rapport

| Élément | Statut |
|---------|--------|
| #070D1A éradiqué (24 occ.) | ✅/❌ |
| #0EA5E9 éradiqué (22 occ.) | ✅/❌ |
| CSS rgba blanc→noir | ✅/❌ |
| Palette C_LIGHT blanche | ✅/❌ |
| Palette C_DARK neutre | ✅/❌ |
| Police Inter | ✅/❌ |
| Landing page LISIBLE | ✅/❌ |
| Sidebar scrollable | ✅/❌ |
| Kanban fonctionnel | ✅/❌ |
| handleTheme MAJ | ✅/❌ |
| Anti-régression | ✅/❌ |

Verdict : 🟢 WHITE & READY / 🟠 PRESQUE / 🔴 PAS BON

Retourne-moi le fichier COMPLET.
```
